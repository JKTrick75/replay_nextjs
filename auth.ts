import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { z } from 'zod';
import { prisma } from '@/app/lib/db';
import bcrypt from 'bcryptjs';
import { authConfig } from './auth.config';

//Esquema para validar lo que llega del formulario de login
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma), 
  session: { strategy: 'jwt' },   
  providers: [
    // --- PROVEEDOR DE GOOGLE ---
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true, 
    }),

    // --- PROVEEDOR DE CREDENCIALES ---
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = LoginSchema.safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;

          const user = await prisma.user.findUnique({
            where: { email },
          });

          // Si no hay usuario, o si el usuario NO tiene contraseña (Google), paramos aquí.
          if (!user || !user.password) return null; 

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) {
            return user;
          }
        }

        console.log('Credenciales inválidas');
        return null;
      },
    }),
  ],
});