import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { prisma } from '@/app/lib/db'; // 👇 Importamos Prisma
import bcrypt from 'bcryptjs';
import { authConfig } from './auth.config';

// Esquema para validar lo que llega del formulario de login
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        // 1. Validar formato de email/password con Zod
        const parsedCredentials = LoginSchema.safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;

          // 2. Buscar usuario en MySQL usando PRISMA 👇
          const user = await prisma.user.findUnique({
            where: { email },
          });

          // Si no existe el usuario, retornamos null
          if (!user) return null;

          // 3. Comparar contraseñas
          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) {
            // ¡Éxito! Devolvemos el usuario
            return user;
          }
        }

        console.log('Credenciales inválidas');
        return null;
      },
    }),
  ],
});