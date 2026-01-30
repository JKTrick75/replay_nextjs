'use server';
 
import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/app/lib/db';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { State } from '@/app/lib/definitions';

// =========================================================================== //
// -- AUTH -- //
// =========================================================================== //

// --- ESQUEMAS DE VALIDACIÓN ---
const LoginSchema = z.object({
  email: z.string().email({ message: 'Email inválido.' }),
  password: z.string().min(6, { message: 'Mínimo 6 caracteres.' }),
});

// 1. --- SCHEMA DE REGISTRO MEJORADO ---
const RegisterSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 letras.' }),
  email: z.string().email({ message: 'Introduce un email válido.' }),
  
  // Password con Regex: Mínimo 6, 1 mayúscula, 1 minúscula, 1 número
  password: z.string()
    .min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
    .regex(/[A-Z]/, { message: 'Debe contener al menos una mayúscula.' })
    .regex(/[a-z]/, { message: 'Debe contener al menos una minúscula.' })
    .regex(/[0-9]/, { message: 'Debe contener al menos un número.' }),
    
  confirmPassword: z.string(),

  // Datos de ubicación (vendrán del buscador de ciudades)
  city: z.string().min(1, { message: 'Debes seleccionar una ciudad.' }),
  lat: z.coerce.number(), // coerce convierte el string del form a number
  lng: z.coerce.number(),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"], // El error saldrá en este campo
});

// --- 1. ACCIÓN DE LOGIN (CORREGIDA Y FINAL) ---
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    // 1. Intentamos loguearnos.
    // Esto lanzará un error "NEXT_REDIRECT" si sale bien, 
    // o un "AuthError" si sale mal.
    await signIn('credentials', formData);
    
  } catch (error) {
    // 2. Si es un error de credenciales incorrectas, lo devolvemos al front.
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Credenciales incorrectas.';
        default:
          return 'Algo salió mal.';
      }
    }
    
    // 3. TRUCO CLAVE:
    // Si llegamos aquí, NO es un error de Auth, así que probablemente sea 
    // la redirección exitosa automática de NextAuth (que intentaría ir al callbackUrl).
    // NO hacemos "throw error" aquí. Lo ignoramos para anular esa redirección.
  }

  // 4. FORZAMOS LA REDIRECCIÓN MANUAL LIMPIA
  // Al llegar aquí, la sesión ya está creada.
  // Mandamos al usuario al dashboard sin parámetros extra en la URL.
  redirect('/dashboard');
}

// --- ACCIÓN DE REGISTRO ---
export async function register(prevState: State, formData: FormData) {
  // Validamos todo (incluyendo que las passwords coincidan)
  const validatedFields = RegisterSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Revisa los errores del formulario.',
    };
  }

  const { name, email, password, city, lat, lng } = validatedFields.data;
  
  // Hash de contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  // 👇 GENERAMOS EL AVATAR AUTOMÁTICO (DiceBear)
  // Usamos el nombre del usuario como 'seed' para que siempre salga el mismo muñeco
  const profileImage = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${encodeURIComponent(name)}`;

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        city,
        lat,
        lng,
        image: profileImage, // 👈 GUARDAMOS LA FOTO AQUÍ
      },
    });
  } catch (error) {
    console.error(error);
    return { message: 'Error: El usuario ya existe o falló la base de datos.' };
  }

  redirect('/login');
}

// --- 3. ACCIÓN DE CERRAR SESIÓN ---
export async function logout() {
  await signOut({ redirectTo: '/' });
}

// =========================================================================== //
// --- CRUD DASHBOARD ---- //
// =========================================================================== //

// --- 1. CREATE ---
const CreateListingSchema = z.object({
  // gameId es opcional (puede venir vacío si es un juego nuevo)
  gameId: z.string().optional(),
  // newGameTitle es opcional (puede venir vacío si seleccionó uno existente)
  newGameTitle: z.string().optional(),
  
  // 👇 NUEVO: Campo opcional para la imagen (puede ser URL o vacío)
  coverImage: z.string().optional(),

  platformId: z.string().min(1, { message: 'Selecciona una plataforma.' }),
  price: z.coerce.number().gt(0, { message: 'El precio debe ser mayor a 0.' }),
  // 👇 SOLUCIÓN: Usamos 'message' directamente
  condition: z.enum(['Nuevo', 'Seminuevo', 'Usado'] as const, {
    message: 'Selecciona un estado válido.',
  }),
  description: z.string().optional(),
}).refine((data) => data.gameId || data.newGameTitle, {
  // Validación personalizada: O tenemos ID, o tenemos Título nuevo
  message: "Debes buscar un juego existente o escribir uno nuevo.",
  path: ["newGameTitle"], // El error saldrá en el campo de texto
});

// --- ACCIÓN: CREAR ANUNCIO ---
export async function createListing(prevState: State, formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    return { message: 'Debes iniciar sesión.' };
  }

  // Buscamos al usuario para obtener su ID y SU UBICACIÓN (lat/lng)
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return { message: 'Usuario no encontrado.' };

  // Validamos los datos del formulario
  const validatedFields = CreateListingSchema.safeParse({
    gameId: formData.get('gameId'),
    newGameTitle: formData.get('gameSearch'), // El input de texto se llama 'gameSearch'
    coverImage: formData.get('coverImage'),     // 👇 Recogemos la URL de la imagen
    platformId: formData.get('platformId'),
    price: formData.get('price'),
    condition: formData.get('condition'),
    description: formData.get('description'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos obligatorios.',
    };
  }

  const { gameId, newGameTitle, coverImage, platformId, price, condition, description } = validatedFields.data;
  
  let finalGameId = gameId;

  try {
    // 1. GESTIÓN DEL JUEGO (Existente vs Nuevo)
    if (!finalGameId && newGameTitle) {
      // Buscamos si existe por nombre (para evitar duplicados por error)
      const existingGame = await prisma.game.findFirst({
        where: { title: newGameTitle },
      });

      if (existingGame) {
        finalGameId = existingGame.id;
      } else {
        // Si no existe, LO CREAMOS
        const newGame = await prisma.game.create({
          data: {
            title: newGameTitle,
            // 👇 Si hay URL válida la usamos, si no, ponemos el placeholder
            coverImage: coverImage && coverImage.trim() !== '' ? coverImage : '/placeholder.png',
            genre: 'Varios',
            description: 'Añadido por la comunidad.',
          },
        });
        finalGameId = newGame.id;
      }
    }

    if (!finalGameId) {
      return { message: 'Error: No se pudo identificar el juego.' };
    }

    // 2. CÁLCULO DE UBICACIÓN (Basado en el Usuario)
    // Usamos la ubicación del perfil del usuario. Si no tiene (null), usamos Madrid por defecto.
    const userLat = user.lat ?? 40.416775; 
    const userLng = user.lng ?? -3.703790;

    // "Jitter": Desplazamiento aleatorio pequeño (~2km) para no revelar la casa exacta
    const jitterLat = (Math.random() - 0.5) * 0.02; 
    const jitterLng = (Math.random() - 0.5) * 0.02;

    // 3. CREAR EL ANUNCIO
    await prisma.listing.create({
      data: {
        sellerId: user.id,
        gameId: finalGameId,
        platformId,
        price,
        condition,
        description: description || '',
        status: 'active',
        // Guardamos la ubicación calculada (Ciudad del usuario + margen aleatorio)
        lat: userLat + jitterLat,
        lng: userLng + jitterLng,
      },
    });

  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Error al guardar en base de datos.' };
  }

  revalidatePath('/dashboard/ventas');
  revalidatePath('/tienda');
  redirect('/dashboard/ventas');
}

// --- 2. UPDATE ---
export async function updateListing(
  id: string, 
  prevState: State, 
  formData: FormData
) {
  const session = await auth();
  if (!session?.user?.email) return { message: 'Debes iniciar sesión.' };

  // Reutilizamos el mismo esquema de validación
  const validatedFields = CreateListingSchema.safeParse({
    gameId: formData.get('gameId'),
    newGameTitle: formData.get('gameSearch'),
    coverImage: formData.get('coverImage'),
    platformId: formData.get('platformId'),
    price: formData.get('price'),
    condition: formData.get('condition'),
    description: formData.get('description'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos obligatorios.',
    };
  }

  const { gameId, newGameTitle, coverImage, platformId, price, condition, description } = validatedFields.data;
  let finalGameId = gameId;

  try {
    // 1. GESTIÓN DEL JUEGO (Igual que en crear)
    if (!finalGameId && newGameTitle) {
      const existingGame = await prisma.game.findFirst({ where: { title: newGameTitle } });

      if (existingGame) {
        finalGameId = existingGame.id;
        // OPCIONAL: Si editamos y ponemos una foto nueva a un juego existente, actualizamos la foto del juego
        if (coverImage && coverImage.trim() !== '') {
            await prisma.game.update({
                where: { id: finalGameId },
                data: { coverImage }
            });
        }
      } else {
        const newGame = await prisma.game.create({
          data: {
            title: newGameTitle,
            coverImage: coverImage && coverImage.trim() !== '' ? coverImage : '/placeholder.png',
            genre: 'Varios',
            description: 'Añadido por la comunidad.',
          },
        });
        finalGameId = newGame.id;
      }
    } else if (finalGameId && coverImage && coverImage.trim() !== '') {
        // Si seleccionamos un juego existente pero cambiamos la URL en el form de editar
        await prisma.game.update({
            where: { id: finalGameId },
            data: { coverImage }
        });
    }

    if (!finalGameId) return { message: 'Error al identificar el juego.' };

    // 2. ACTUALIZAR EL ANUNCIO
    await prisma.listing.update({
      where: { id },
      data: {
        gameId: finalGameId,
        platformId,
        price,
        condition,
        description: description || '',
      },
    });

  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Error al actualizar el anuncio.' };
  }

  revalidatePath('/dashboard/ventas');
  revalidatePath('/tienda');
  redirect('/dashboard/ventas');
}

// --- 3. DELETE ---
export async function deleteListing(id: string) {
  const session = await auth();
  if (!session?.user?.email) return { message: 'No autenticado' };

  try {
    await prisma.listing.delete({
      where: { id },
    });
    revalidatePath('/dashboard/ventas');
    revalidatePath('/tienda');
    return { message: 'Anuncio eliminado.' };
  } catch (error) {
    return { message: 'Error al eliminar.' };
  }
}

// =========================================================================== //
// --- TOGGLE LIKE --- //
// =========================================================================== //
export async function toggleFavorite(listingId: string) {
  // 1. Autenticación
  const session = await auth();
  if (!session?.user?.email) {
    return { message: 'Debes iniciar sesión.' };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return { message: 'Usuario no encontrado.' };

  try {
    // 2. Comprobar si ya existe el like
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        // Prisma crea esta clave compuesta automáticamente por el @@unique
        userId_listingId: {
          userId: user.id,
          listingId: listingId,
        },
      },
    });

    if (existingFavorite) {
      // SI EXISTE -> BORRAMOS (Dislike)
      await prisma.favorite.delete({
        where: {
          id: existingFavorite.id,
        },
      });
      revalidatePath('/dashboard/favoritos');
      revalidatePath(`/tienda/${listingId}`);
      return { message: 'Eliminado de favoritos.', isFavorite: false };
    } else {
      // NO EXISTE -> CREAMOS (Like)
      await prisma.favorite.create({
        data: {
          userId: user.id,
          listingId: listingId,
        },
      });
      revalidatePath('/dashboard/favoritos');
      revalidatePath(`/tienda/${listingId}`);
      return { message: 'Añadido a favoritos.', isFavorite: true };
    }

  } catch (error) {
    console.error('Error toggling favorite:', error);
    return { message: 'Error al actualizar favorito.' };
  }
}

// =========================================================================== //
// --- PERFIL DE USUARIO --- //
// =========================================================================== //

// Schema para la actualización de perfil
const UpdateProfileSchema = z.object({
  name: z.string().min(2, { message: 'El nombre es muy corto.' }),
  
  city: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  
  email: z.string().email().optional().or(z.literal('')),
  confirmEmail: z.string().optional().or(z.literal('')),

  currentPassword: z.string().optional().or(z.literal('')),
  
  // 👇 VALIDACIÓN SEGURA (Igual que Register)
  newPassword: z.string()
    .min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
    .regex(/[A-Z]/, { message: 'Debe contener al menos una mayúscula.' })
    .regex(/[a-z]/, { message: 'Debe contener al menos una minúscula.' })
    .regex(/[0-9]/, { message: 'Debe contener al menos un número.' })
    .optional()
    .or(z.literal('')), // Permite que esté vacía si no quiere cambiarla

  confirmNewPassword: z.string().optional().or(z.literal('')),
  
  image: z.string().optional(),
})
.refine((data) => {
  // SOLUCIÓN: Solo validamos si el usuario ha escrito una confirmación
  if (data.confirmEmail && data.confirmEmail !== '') {
    return data.email === data.confirmEmail;
  }
  return true; 
}, {
  message: "Los correos electrónicos no coinciden.",
  path: ["confirmEmail"],
})
.refine((data) => {
  // Lo mismo para la contraseña
  if (data.confirmNewPassword && data.confirmNewPassword !== '') {
    return data.newPassword === data.confirmNewPassword;
  }
  return true;
}, {
  message: "Las contraseñas nuevas no coinciden.",
  path: ["confirmNewPassword"],
});

export async function updateProfile(prevState: State, formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) return { message: 'No autenticado' };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return { message: 'Usuario no encontrado' };

  // 1. Validar datos
  const validatedFields = UpdateProfileSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Revisa los errores del formulario.',
    };
  }

  const { 
    name, city, lat, lng, image, 
    email, currentPassword, newPassword 
  } = validatedFields.data;

  const dataToUpdate: any = { 
    name, 
    city,
    lat, 
    lng, 
    image 
  };

  // 2. Lógica de cambio de EMAIL
  if (email && email !== user.email) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { 
        errors: { email: ['Este correo ya está en uso por otro usuario.'] },
        message: 'Error en el correo.' 
      };
    }
    dataToUpdate.email = email;
  }

  // 3. Lógica de cambio de CONTRASEÑA
  if (newPassword) {
    if (!currentPassword) {
      return { 
        errors: { currentPassword: ['Debes introducir tu contraseña actual.'] },
        message: 'Falta contraseña actual.' 
      };
    }

    // 👇 VALIDACIÓN: Que no sea igual a la actual (Solo si se escribe una nueva)
    if (newPassword === currentPassword) {
         return {
            errors: { newPassword: ['La nueva contraseña no puede ser igual a la actual.'] },
            message: 'La contraseña debe ser diferente.'
         };
    }

    const passwordsMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordsMatch) {
      return { 
        errors: { currentPassword: ['La contraseña actual es incorrecta.'] },
        message: 'Error de seguridad.' 
      };
    }

    // Hashear la nueva
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    dataToUpdate.password = hashedPassword;
  }

  // 4. Actualizar en DB
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: dataToUpdate,
    });
    
    revalidatePath('/dashboard/perfil');
    revalidatePath('/', 'layout'); 
    
    return { message: '¡Perfil actualizado con éxito!' };

  } catch (error) {
    console.error(error);
    return { message: 'Error al actualizar el perfil.' };
  }
}

// =========================================================================== //
// --- CARRITO DE LA COMPRA --- //
// =========================================================================== //

// 1. AÑADIR AL CARRITO
export async function addToCart(listingId: string) {
  const session = await auth();
  if (!session?.user?.email) return { message: 'Inicia sesión para comprar.' };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { cart: true },
  });

  if (!user) return { message: 'Usuario no encontrado.' };

  // Verificamos que el producto exista y esté activo
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
  });

  if (!listing || listing.status !== 'active') {
    return { message: 'Este producto ya no está disponible.' };
  }

  // 🔒 SEGURIDAD: Aunque el botón esté oculto, bloqueamos la acción aquí también
  if (listing.sellerId === user.id) {
    return { message: 'No puedes comprar tu propio producto.' };
  }

  try {
    // Si el usuario no tiene carrito, lo creamos al vuelo
    let cartId = user.cart?.id;
    if (!cartId) {
      const newCart = await prisma.cart.create({
        data: { userId: user.id },
      });
      cartId = newCart.id;
    }

    // Añadimos el item
    await prisma.cartItem.create({
      data: {
        cartId: cartId,
        listingId: listingId,
      },
    });

    revalidatePath('/carrito');
    revalidatePath(`/tienda/${listingId}`); // Refrescamos la tienda
    return { message: 'Añadido al carrito', success: true };

  } catch (error) {
    // Si falla es probable que ya estuviera en el carrito (por el @@unique)
    return { message: 'Ya tienes este producto en el carrito.', success: true }; 
  }
}

// 2. QUITAR DEL CARRITO
export async function removeFromCart(itemId: string) {
  try {
    await prisma.cartItem.delete({
      where: { id: itemId },
    });
    revalidatePath('/carrito');
    return { message: 'Eliminado.' };
  } catch (error) {
    return { message: 'Error al eliminar.' };
  }
}

// 3. REALIZAR PEDIDO (CHECKOUT SIMULADO)
export async function checkout() {
  const session = await auth();
  if (!session?.user?.email) return { message: 'No autenticado' };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { 
      cart: {
        include: { items: { include: { listing: true } } }
      } 
    },
  });

  if (!user || !user.cart || user.cart.items.length === 0) {
    return { message: 'El carrito está vacío.' };
  }

  // Lógica de Transacción Segura:
  const itemsToBuy = user.cart.items;
  
  // Revisamos si alguien compró algo mientras tú mirabas el carrito
  const unavailableItems = itemsToBuy.filter(item => item.listing.status !== 'active');

  if (unavailableItems.length > 0) {
    return { 
      message: `Algunos productos ya no están disponibles. Revisa tu carrito.`,
      error: true 
    };
  }

  try {
    // TRANSACCIÓN: O se compra todo y se vacía el carrito, o no se hace nada.
    await prisma.$transaction(async (tx) => {
      
      // A. Marcar cada producto como VENDIDO y asignar COMPRADOR
      for (const item of itemsToBuy) {
        await tx.listing.update({
          where: { id: item.listingId },
          data: {
            status: 'sold',
            buyerId: user.id, // Asignamos el dueño nuevo
            soldAt: new Date(),
          },
        });
      }

      // B. Vaciar el carrito
      await tx.cartItem.deleteMany({
        where: { cartId: user.cart!.id },
      });
    });

    revalidatePath('/dashboard/compras'); // Actualizamos historial
    revalidatePath('/dashboard'); // Actualizamos resumen
    return { message: '¡Compra realizada con éxito!', success: true };

  } catch (error) {
    console.error(error);
    return { message: 'Error al procesar el pedido.' };
  }
}