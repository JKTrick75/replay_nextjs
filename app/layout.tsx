import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/ui/navbar";
import Footer from "@/app/ui/footer";
import { Providers } from "@/app/ui/providers";
// 👇 Importamos la autenticación y la base de datos
import { auth } from "@/auth";
import { prisma } from '@/app/lib/db'; 

const roboto = Roboto({ 
  weight: ['400', '500', '700'],
  subsets: ["latin"],
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: "Replay - Tu tienda de videojuegos",
  description: "Compra y vende juegos de segunda mano",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  // 1. Obtenemos la sesión (la cookie)
  const session = await auth();
  
  // Variable para el usuario que pasaremos al Navbar
  let user = undefined;

  // 2. TRUCO DE REFRESCO: 
  // Si hay sesión, buscamos los datos REALES en la base de datos.
  // Así, si cambias la foto en el perfil, se verá al instante al recargar (router.refresh()), 
  // ignorando la foto vieja que se quedó guardada en la cookie de sesión.
  if (session?.user?.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { name: true, email: true, image: true } // Solo traemos lo necesario para el Navbar
    });
    
    if (dbUser) {
      // Usamos los datos frescos de la DB
      user = {
        name: dbUser.name,
        email: dbUser.email,
        image: dbUser.image,
      };
    } else {
      // Fallback: si falla la DB, usamos lo que haya en la sesión
      user = session.user;
    }
  }

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${roboto.className} antialiased bg-white-off dark:bg-neutral-950 text-dark dark:text-white-off flex flex-col min-h-screen transition-colors duration-300`}>
        <Providers>
          {/* 👇 Pasamos el usuario FRESCO al Navbar */}
          <Navbar user={user} />
          
          <main className="grow">
            {children}
          </main>
          
          <Footer />
        </Providers>
      </body>
    </html>
  );
}