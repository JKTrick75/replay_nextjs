import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/ui/navbar";
import Footer from "@/app/ui/footer";
import { Providers } from "@/app/ui/providers";

const roboto = Roboto({ 
  weight: ['400', '500', '700'],
  subsets: ["latin"],
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: "Replay - Tu tienda de videojuegos",
  description: "Compra y vende juegos de segunda mano",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${roboto.className} antialiased bg-white-off dark:bg-gray-900 text-dark dark:text-white-off flex flex-col min-h-screen transition-colors duration-300`}>
        <Providers>
          <Navbar />
          <main className="grow">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}