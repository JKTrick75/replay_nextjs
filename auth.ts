import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config'; // Subimos 2 niveles para encontrar el archivo en la raíz
import { z } from 'zod';
import connectDB from '@/app/lib/db'; // Tu conexión a Mongo
import { User } from '@/app/lib/models'; // Tu modelo de Usuario
import bcrypt from 'bcryptjs'; // La librería que instalamos

// Esquema de validación para el formulario
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        // 1. Validar que los datos del formulario son correctos (formato)
        const parsedCredentials = LoginSchema.safeParse(credentials);
 
        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          
          // 2. Conectar a MongoDB
          await connectDB();
          
          // 3. Buscar el usuario por email
          const user = await User.findOne({ email });
          
          if (!user) return null; // Usuario no encontrado
          
          // 4. Comparar la contraseña del formulario con la encriptada en la BD
          const passwordsMatch = await bcrypt.compare(password, user.password);
 
          if (passwordsMatch) return user;
        }
 
        console.log('Credenciales inválidas');
        return null;
      },
    }),
  ],
});