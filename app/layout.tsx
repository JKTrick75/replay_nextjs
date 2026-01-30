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
  
  // Variables para el Navbar
  let user = undefined;
  let cartCount = 0; // 👇 Contador inicializado a 0

  // 2. TRUCO DE REFRESCO + DATOS DEL CARRITO
  if (session?.user?.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        name: true, 
        email: true, 
        image: true,
        // 👇 Incluimos el carrito para contar los items
        cart: {
          include: { items: true }
        }
      } 
    });
    
    if (dbUser) {
      // Usamos los datos frescos de la DB
      user = {
        name: dbUser.name,
        email: dbUser.email,
        image: dbUser.image,
      };
      // 👇 Calculamos cuántos productos hay en el carrito
      cartCount = dbUser.cart?.items.length || 0;
    } else {
      // Fallback
      user = session.user;
    }
  }

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${roboto.className} antialiased bg-white-off dark:bg-neutral-950 text-dark dark:text-white-off flex flex-col min-h-screen transition-colors duration-300`}>
        <Providers>
          {/* 👇 Pasamos usuario y contador al Navbar */}
          <Navbar user={user} cartCount={cartCount} />
          
          <main className="grow">
            {children}
          </main>
          
          <Footer />
        </Providers>
      </body>
    </html>
  );
}