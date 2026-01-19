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

// --- ESQUEMAS DE VALIDACIÓN ---
const LoginSchema = z.object({
  email: z.string().email({ message: 'Email inválido.' }),
  password: z.string().min(6, { message: 'Mínimo 6 caracteres.' }),
});

const RegisterSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 letras.' }),
  email: z.string().email({ message: 'Email inválido.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
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

// --- 2. ACCIÓN DE REGISTRO ---
export async function register(prevState: State, formData: FormData) {
  
  // 1. Validar campos
  const validatedFields = RegisterSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos obligatorios.',
    };
  }

  const { name, email, password } = validatedFields.data;

  try {
    // 2. Verificar si existe (usando Prisma)
    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      return { message: 'Este correo ya está registrado.' };
    }

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Crear usuario en MySQL
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        image: `https://api.dicebear.com/9.x/pixel-art/svg?seed=${email}`,
        role: 'user',
      },
    });

  } catch (error) {
    console.error('Error DB:', error);
    return {
      message: 'Error al crear el usuario en la base de datos.',
    };
  }

  redirect('/login');
}

// --- 3. ACCIÓN DE CERRAR SESIÓN ---
export async function logout() {
  await signOut({ redirectTo: '/' });
}

// --- SCHEMA PARA VALIDAR EL ANUNCIO ---
const CreateListingSchema = z.object({
  // gameId es opcional porque puede que estemos creando uno nuevo
  gameId: z.string().optional(),
  // newGameTitle es opcional porque puede que hayamos elegido uno existente
  newGameTitle: z.string().optional(),
  
  platformId: z.string().min(1, { message: 'Selecciona una plataforma.' }),
  price: z.coerce.number().gt(0, { message: 'El precio debe ser mayor a 0.' }),
  condition: z.enum(['Nuevo', 'Seminuevo', 'Usado'] as const)
    .refine(val => val !== undefined, {
      message: 'Selecciona un estado válido.',
    }),
  description: z.string().optional(),
}).refine((data) => data.gameId || data.newGameTitle, {
  // Validación personalizada: O uno u otro debe existir
  message: "Debes seleccionar un juego o escribir uno nuevo.",
  path: ["newGameTitle"],
});

// --- ACCIÓN: CREAR ANUNCIO ---
export async function createListing(prevState: State, formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    return { message: 'Debes iniciar sesión.' };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return { message: 'Usuario no encontrado.' };

  // Validamos los datos
  const validatedFields = CreateListingSchema.safeParse({
    gameId: formData.get('gameId'),
    newGameTitle: formData.get('gameSearch'), // El input visible se llamará 'gameSearch'
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

  const { gameId, newGameTitle, platformId, price, condition, description } = validatedFields.data;
  let finalGameId = gameId;

  try {
    // LÓGICA DE JUEGO NUEVO
    // Si no hay ID (el usuario escribió algo nuevo), creamos el juego primero
    if (!finalGameId && newGameTitle) {
      // 1. Comprobamos si ya existe por nombre (para evitar duplicados tontos)
      const existingGame = await prisma.game.findFirst({
        where: { title: newGameTitle },
      });

      if (existingGame) {
        finalGameId = existingGame.id;
      } else {
        // 2. Creamos el juego nuevo
        const newGame = await prisma.game.create({
          data: {
            title: newGameTitle,
            coverImage: '/placeholder.png', // Imagen por defecto hasta que alguien la edite
            genre: 'Varios',
            description: 'Juego añadido por la comunidad.',
            // Ojo: Aquí NO vinculamos plataforma obligatoriamente, 
            // la relación N:M se llena implícitamente o se deja limpia.
          },
        });
        finalGameId = newGame.id;
      }
    }

    if (!finalGameId) {
      return { message: 'Error al identificar el juego.' };
    }

    // Coordenadas simuladas (Madrid + Jitter)
    const BASE_LAT = 40.416775;
    const BASE_LNG = -3.703790;
    const jitterLat = (Math.random() - 0.5) * 0.1;
    const jitterLng = (Math.random() - 0.5) * 0.1;

    // CREAMOS EL ANUNCIO
    await prisma.listing.create({
      data: {
        sellerId: user.id,
        gameId: finalGameId,
        platformId,
        price,
        condition,
        description: description || '',
        status: 'active',
        lat: BASE_LAT + jitterLat,
        lng: BASE_LNG + jitterLng,
      },
    });

  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Error al crear el anuncio.' };
  }

  revalidatePath('/dashboard/ventas');
  revalidatePath('/tienda');
  redirect('/dashboard/ventas');
}

// --- ACCIÓN: ALTERNAR FAVORITO (TOGGLE LIKE) ---
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