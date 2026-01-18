'use server';
 
import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/app/lib/db';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

// --- DEFINICIÓN DE TIPOS ---
export type State = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
  };
  message?: string | null;
};

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