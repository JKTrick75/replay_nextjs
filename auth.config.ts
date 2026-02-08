import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
  secret: process.env.AUTH_SECRET,
  
  pages: {
    signIn: '/login', // Si no estás autorizado, te manda aquí
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      // 1. Definimos las rutas protegidas
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnSell = nextUrl.pathname.startsWith('/vender'); // Protegemos también /vender
      const isProtectRoute = isOnDashboard || isOnSell;

      // 2. Lógica de protección
      if (isProtectRoute) {
        if (isLoggedIn) return true;
        return false; // Redirige a /login si no hay sesión
      } else if (isLoggedIn) {
        // 3. Si ya está logueado y está en /login o /register, lo mandamos al dashboard
        // (Pero le dejamos navegar por la tienda tranquilamente)
        if (nextUrl.pathname === '/login' || nextUrl.pathname === '/registro') {
          return Response.redirect(new URL('/dashboard', nextUrl));
        }
      }
      return true;
    },
  },
  providers: [], 
} satisfies NextAuthConfig;