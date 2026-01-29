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

// --- 1. ACCIÓN DE LOGIN ---
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Credenciales incorrectas.';
        default:
          return 'Algo salió mal.';
      }
    }
    throw error;
  }
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