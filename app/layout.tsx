import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/ui/navbar";
import Footer from "@/app/ui/footer";
import { Providers } from "@/app/ui/providers";
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
  
  const session = await auth();
  
  let user = undefined;
  let cartCount = 0; 
  let unreadMessagesCount = 0;

  if (session?.user?.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true,
        name: true, 
        email: true, 
        image: true,
        role: true, 
        cart: {
          include: { items: true }
        }
      } 
    });
    
    if (dbUser) {
      user = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        image: dbUser.image,
        role: dbUser.role,
      };
      cartCount = dbUser.cart?.items.length || 0;

      unreadMessagesCount = await prisma.message.count({
        where: {
          chat: {
            OR: [{ buyerId: dbUser.id }, { sellerId: dbUser.id }]
          },
          senderId: { not: dbUser.id },
          read: false
        }
      });

    } else {
      user = {
        ...session.user,
        role: 'user' 
      };
    }
  }

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${roboto.className} antialiased bg-white-off dark:bg-neutral-950 text-dark dark:text-white-off flex flex-col min-h-screen transition-colors duration-300`}>
        <Providers>
          <Navbar user={user} cartCount={cartCount} unreadCount={unreadMessagesCount} />
          
          <main className="grow">
            {children}
          </main>
          
          <Footer />
        </Providers>
      </body>
    </html>
  );
}