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

const LoginSchema = z.object({
  email: z.string().email({ message: 'Email inválido.' }),
  password: z.string().min(6, { message: 'Mínimo 6 caracteres.' }),
});

const RegisterSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 letras.' }),
  email: z.string().email({ message: 'Introduce un email válido.' }),
  password: z.string()
    .min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
    .regex(/[A-Z]/, { message: 'Debe contener al menos una mayúscula.' })
    .regex(/[a-z]/, { message: 'Debe contener al menos una minúscula.' })
    .regex(/[0-9]/, { message: 'Debe contener al menos un número.' }),
  confirmPassword: z.string(),
  city: z.string().min(1, { message: 'Debes seleccionar una ciudad.' }),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

export async function authenticate(
  prevState: any,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    // 1. Si es un error de Auth (credenciales mal), devolvemos el error
    if (error instanceof AuthError) {
      const timestamp = Date.now();
      switch (error.type) {
        case 'CredentialsSignin':
          return { message: 'Credenciales incorrectas, inténtalo de nuevo.', timestamp };
        default:
          return { message: 'Algo salió mal.', timestamp };
      }
    }

    // 2. IMPORTANTE: Si llegamos aquí, es que NO fue un AuthError.
    // En Next.js, el "éxito" de signIn lanza un error de tipo "NEXT_REDIRECT".
    // Lo detectamos así:
    if ((error as Error).message === 'NEXT_REDIRECT' || (error as any).digest?.includes('NEXT_REDIRECT')) {
        // Frenamos la redirección del servidor y le decimos al cliente "Todo OK"
        return { success: true, message: '¡Hola de nuevo!' };
    }

    // Si es otro tipo de error real (base de datos caída, etc), lo lanzamos
    throw error;
  }
  
  // (Este return es por si acaso signIn no lanzara nada, aunque siempre lo hace)
  return { success: true, message: '¡Hola de nuevo!' };
}

export async function register(prevState: State, formData: FormData) {
  const validatedFields = RegisterSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Revisa los errores del formulario.',
    };
  }

  const { name, email, password, city, lat, lng } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);
  const profileImage = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${encodeURIComponent(name)}`;

  try {
    await prisma.user.create({
      data: {
        name, email, password: hashedPassword, city, lat, lng, image: profileImage,
      },
    });
    
    // 🟢 CAMBIO: Retornamos éxito para que el cliente muestre la alerta
    return { success: true, message: 'Cuenta creada correctamente.' };

  } catch (error) {
    console.error(error);
    return { message: 'El correo ya está registrado.' };
  }
}

export async function logout() {
  // 🟢 CAMBIO: redirect: false para permitir Toast en el cliente
  await signOut({ redirect: false });
  revalidatePath('/');
  return { message: 'Has cerrado sesión' };
}

// =========================================================================== //
// --- CRUD DASHBOARD (PRODUCTOS) ---- //
// =========================================================================== //

const CreateListingSchema = z.object({
  gameId: z.string().optional(),
  newGameTitle: z.string().optional(),
  coverImage: z.string().optional(),
  genre: z.string().optional(),
  platformId: z.string().min(1, { message: 'Selecciona una plataforma.' }),
  price: z.coerce.number().gt(0, { message: 'El precio debe ser mayor a 0.' }),
  condition: z.enum(['Nuevo', 'Seminuevo', 'Usado'] as const, {
    message: 'Selecciona un estado válido.',
  }),
  description: z.string().optional(),
}).refine((data) => data.gameId || data.newGameTitle, {
  message: "Debes buscar un juego existente o escribir uno nuevo.",
  path: ["newGameTitle"],
});

export async function createListing(prevState: State, formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) return { message: 'Debes iniciar sesión.' };

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return { message: 'Usuario no encontrado.' };

  const validatedFields = CreateListingSchema.safeParse({
    gameId: formData.get('gameId'),
    newGameTitle: formData.get('gameSearch'),
    coverImage: formData.get('coverImage') || undefined,
    genre: formData.get('genre') || undefined,
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

  const { gameId, newGameTitle, coverImage, genre, platformId, price, condition, description } = validatedFields.data;
  let finalGameId = gameId;

  try {
    if (!finalGameId && newGameTitle) {
      const existingGame = await prisma.game.findFirst({ where: { title: newGameTitle } });
      if (existingGame) {
        finalGameId = existingGame.id;
      } else {
        const newGame = await prisma.game.create({
          data: {
            title: newGameTitle,
            coverImage: coverImage && coverImage.trim() !== '' ? coverImage : '/placeholder.png',
            genre: genre || 'Varios',
            description: 'Añadido por la comunidad.',
          },
        });
        finalGameId = newGame.id;
      }
    }
    if (!finalGameId) return { message: 'Error: No se pudo identificar el juego.' };

    const userLat = user.lat ?? 40.416775; 
    const userLng = user.lng ?? -3.703790;
    const jitterLat = (Math.random() - 0.5) * 0.02; 
    const jitterLng = (Math.random() - 0.5) * 0.02;

    await prisma.listing.create({
      data: {
        sellerId: user.id,
        gameId: finalGameId,
        platformId,
        price,
        condition,
        description: description || '',
        status: 'active',
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
  return { message: 'Producto publicado correctamente' };
}

export async function updateListing(id: string, prevState: State, formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) return { message: 'Debes iniciar sesión.' };

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
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Faltan campos obligatorios.' };
  }

  const { gameId, newGameTitle, coverImage, platformId, price, condition, description } = validatedFields.data;
  let finalGameId = gameId;

  try {
    if (!finalGameId && newGameTitle) {
      const existingGame = await prisma.game.findFirst({ where: { title: newGameTitle } });
      if (existingGame) {
        finalGameId = existingGame.id;
        if (coverImage && coverImage.trim() !== '') {
            await prisma.game.update({ where: { id: finalGameId }, data: { coverImage } });
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
        await prisma.game.update({ where: { id: finalGameId }, data: { coverImage } });
    }

    if (!finalGameId) return { message: 'Error al identificar el juego.' };

    await prisma.listing.update({
      where: { id },
      data: { gameId: finalGameId, platformId, price, condition, description: description || '' },
    });
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Error al actualizar el anuncio.' };
  }

  revalidatePath('/dashboard/ventas');
  revalidatePath('/tienda');
  return { message: 'Producto actualizado correctamente' };
}

export async function deleteListing(id: string) {
  const session = await auth();
  if (!session?.user?.email) return { message: 'No autenticado' };
  try {
    await prisma.listing.delete({ where: { id } });
    revalidatePath('/dashboard/ventas');
    revalidatePath('/tienda');
    return { message: 'Anuncio eliminado.' };
  } catch (error) {
    return { message: 'Error al eliminar.' };
  }
}

// =========================================================================== //
// --- FAVORITOS --- //
// =========================================================================== //
export async function toggleFavorite(listingId: string) {
  const session = await auth();
  if (!session?.user?.email) return { message: 'Debes iniciar sesión.' };

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return { message: 'Usuario no encontrado.' };

  try {
    const existingFavorite = await prisma.favorite.findUnique({
      where: { userId_listingId: { userId: user.id, listingId: listingId } },
    });

    if (existingFavorite) {
      await prisma.favorite.delete({ where: { id: existingFavorite.id } });
      revalidatePath('/dashboard/favoritos');
      revalidatePath(`/tienda/${listingId}`);
      return { message: 'Eliminado de favoritos.', isFavorite: false };
    } else {
      await prisma.favorite.create({
        data: { userId: user.id, listingId: listingId },
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
const UpdateProfileSchema = z.object({
  name: z.string().min(2, { message: 'El nombre es muy corto.' }),
  city: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  email: z.string().email().optional().or(z.literal('')),
  confirmEmail: z.string().optional().or(z.literal('')),
  currentPassword: z.string().optional().or(z.literal('')),
  newPassword: z.string().min(6).optional().or(z.literal('')),
  confirmNewPassword: z.string().optional().or(z.literal('')),
  image: z.string().optional(),
})
.refine((data) => {
  if (data.confirmEmail && data.confirmEmail !== '') return data.email === data.confirmEmail;
  return true; 
}, { message: "Los correos electrónicos no coinciden.", path: ["confirmEmail"] })
.refine((data) => {
  if (data.confirmNewPassword && data.confirmNewPassword !== '') return data.newPassword === data.confirmNewPassword;
  return true;
}, { message: "Las contraseñas nuevas no coinciden.", path: ["confirmNewPassword"] });

export async function updateProfile(prevState: State, formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) return { message: 'No autenticado' };

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return { message: 'Usuario no encontrado' };

  const validatedFields = UpdateProfileSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) return { errors: validatedFields.error.flatten().fieldErrors, message: 'Revisa los errores.' };

  const { name, city, lat, lng, image, email, currentPassword, newPassword } = validatedFields.data;
  const dataToUpdate: any = { name, city, lat, lng, image };

  if (email && email !== user.email) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return { errors: { email: ['Correo ya en uso.'] }, message: 'Error en el correo.' };
    dataToUpdate.email = email;
  }

  if (newPassword) {
    if (!currentPassword) return { errors: { currentPassword: ['Falta contraseña actual.'] }, message: 'Falta contraseña actual.' };
    if (newPassword === currentPassword) return { errors: { newPassword: ['La nueva debe ser diferente.'] }, message: 'Contraseña igual.' };

    const passwordsMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordsMatch) return { errors: { currentPassword: ['Contraseña incorrecta.'] }, message: 'Error de seguridad.' };

    dataToUpdate.password = await bcrypt.hash(newPassword, 10);
  }

  try {
    await prisma.user.update({ where: { id: user.id }, data: dataToUpdate });
    revalidatePath('/dashboard/perfil');
    revalidatePath('/', 'layout');
    return { message: '¡Perfil actualizado con éxito!' };
  } catch (error) {
    console.error(error);
    return { message: 'Error al actualizar el perfil.' };
  }
}

// =========================================================================== //
// --- CARRITO Y LOGÍSTICA --- //
// =========================================================================== //

export async function addToCart(listingId: string) {
  const session = await auth();
  if (!session?.user?.email) return { message: 'Inicia sesión para comprar.' };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { cart: true },
  });

  if (!user) return { message: 'Usuario no encontrado.' };

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.status !== 'active') return { message: 'Este producto ya no está disponible.' };

  if (listing.sellerId === user.id) return { message: 'No puedes comprar tu propio producto.' };

  try {
    let cartId = user.cart?.id;
    if (!cartId) {
      const newCart = await prisma.cart.create({ data: { userId: user.id } });
      cartId = newCart.id;
    }
    await prisma.cartItem.create({ data: { cartId: cartId, listingId: listingId } });

    revalidatePath('/carrito');
    revalidatePath(`/tienda/${listingId}`);
    return { message: 'Añadido al carrito', success: true };
  } catch (error) {
    return { message: 'Ya tienes este producto en el carrito.', success: true }; 
  }
}

export async function removeFromCart(itemId: string) {
  try {
    await prisma.cartItem.delete({ where: { id: itemId } });
    revalidatePath('/carrito');
    return { message: 'Eliminado.' };
  } catch (error) {
    return { message: 'Error al eliminar.' };
  }
}

export async function toggleCartItemSelection(itemId: string, isSelected: boolean) {
  try {
    await prisma.cartItem.update({
      where: { id: itemId },
      data: { selected: isSelected },
    });
    revalidatePath('/carrito');
    revalidatePath('/checkout');
    return { success: true };
  } catch (error) {
    return { message: 'Error al actualizar selección.' };
  }
}

export async function toggleAllCartItems(isSelected: boolean) {
  const session = await auth();
  if (!session?.user?.email) return { message: 'No autenticado' };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { cart: true },
  });

  if (!user || !user.cart) return;

  try {
    await prisma.cartItem.updateMany({
      where: { cartId: user.cart.id },
      data: { selected: isSelected },
    });
    
    revalidatePath('/carrito');
    revalidatePath('/checkout');
    return { success: true };
  } catch (error) {
    return { message: 'Error al actualizar.' };
  }
}

export async function processCheckout(shippingAddress: string) {
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

  const itemsToBuy = user.cart.items.filter(item => item.selected);

  if (itemsToBuy.length === 0) {
    return { message: 'No has seleccionado ningún producto para comprar.' };
  }

  const unavailableItems = itemsToBuy.filter(item => item.listing.status !== 'active');

  if (unavailableItems.length > 0) {
    return { message: `Algunos productos seleccionados ya no están disponibles.`, error: true };
  }

  try {
    await prisma.$transaction(async (tx) => {
      
      for (const item of itemsToBuy) {
        await tx.listing.update({
          where: { id: item.listingId },
          data: {
            status: 'sold',
            buyerId: user.id,
            soldAt: new Date(),
            shippingAddress: shippingAddress,
            deliveryStatus: 'pending',
          },
        });
      }

      await tx.cartItem.deleteMany({
        where: { 
          cartId: user.cart!.id,
          selected: true 
        },
      });
    });

    revalidatePath('/dashboard/compras');
    revalidatePath('/dashboard');
    revalidatePath('/carrito');
    
    return { message: '¡Pedido confirmado!', success: true };

  } catch (error) {
    console.error(error);
    return { message: 'Error al procesar el pedido.' };
  }
}

export async function confirmDelivery(listingId: string) {
  const session = await auth();
  if (!session?.user?.email) return { message: 'No autenticado' };

  try {
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) return { message: 'Pedido no encontrado' };

    await prisma.listing.update({
      where: { id: listingId },
      data: { deliveryStatus: 'delivered' }
    });

    revalidatePath(`/dashboard/compras/${listingId}`);
    return { message: 'Entrega confirmada', success: true };
  } catch (error) {
    return { message: 'Error al confirmar.' };
  }
}

export async function markAsShipped(listingId: string) {
  const session = await auth();
  if (!session?.user?.email) return { message: 'No autenticado' };

  try {
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!listing || listing.sellerId !== user?.id) {
      return { message: 'No tienes permiso.' };
    }

    await prisma.listing.update({
      where: { id: listingId },
      data: { deliveryStatus: 'shipped' }
    });

    revalidatePath('/dashboard/ventas');
    return { message: 'Pedido marcado como enviado.', success: true };
  } catch (error) {
    return { message: 'Error al actualizar.' };
  }
}

export async function cancelOrder(listingId: string) {
  const session = await auth();
  if (!session?.user?.email) return { message: 'No autenticado' };

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return { message: 'Usuario no encontrado' };

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return { message: 'Pedido no encontrado' };

  // --- 👮‍♂️ LÓGICA DE PERMISOS ---
  const isSeller = listing.sellerId === user.id;
  const isBuyer = listing.buyerId === user.id;

  // 1. Si no eres ni el vendedor ni el comprador -> Fuera
  if (!isSeller && !isBuyer) return { message: 'No tienes permiso.' };

  // 2. Nadie puede cancelar si ya se entregó
  if (listing.deliveryStatus === 'delivered') return { message: 'No puedes cancelar un pedido ya entregado.' };
  
  // 3. RESTRICCIÓN COMPRADOR: Solo si está "Pendiente"
  if (isBuyer && listing.deliveryStatus !== 'pending') {
      return { message: 'El pedido ya ha sido enviado, no puedes cancelarlo automáticamente.' };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // A. Cancelamos el pedido actual
      await tx.listing.update({
        where: { id: listingId },
        data: { 
          status: 'cancelled',
          deliveryStatus: 'cancelled' 
        }
      });

      // B. Clonamos el producto para que vuelva a la tienda (disponible para otros)
      await tx.listing.create({
        data: {
          sellerId: listing.sellerId,
          gameId: listing.gameId,
          platformId: listing.platformId,
          price: listing.price,
          condition: listing.condition,
          description: listing.description,
          status: 'active',
          lat: listing.lat,
          lng: listing.lng,
        }
      });
    });

    // Revalidamos todas las rutas afectadas
    revalidatePath('/dashboard/ventas');
    revalidatePath('/dashboard/compras');
    revalidatePath(`/dashboard/compras/${listingId}`);
    
    return { message: 'Pedido cancelado y reembolsado correctamente.', success: true };

  } catch (error) {
    console.error(error);
    return { message: 'Error al cancelar.' };
  }
}