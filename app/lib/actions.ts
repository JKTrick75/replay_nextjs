'use server';
 
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { z } from 'zod';
import connectDB from '@/app/lib/db';
import { User } from '@/app/lib/models';
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
// Nota: Authenticate suele devolver string o undefined, lo dejamos simple por ahora
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
// Aquí cambiamos el tipo de entrada a 'State'
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
    await connectDB();

    const userExists = await User.findOne({ email });
    if (userExists) {
      return { message: 'Este correo ya está registrado.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      image: `https://ui-avatars.com/api/?name=${name}&background=random`,
      role: 'user'
    });

  } catch (error) {
    return {
      message: 'Error en la base de datos.',
    };
  }

  redirect('/login');
}