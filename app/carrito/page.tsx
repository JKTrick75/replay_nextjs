import { auth } from '@/auth';
import { prisma } from '@/app/lib/db';
import Link from 'next/link';
import { ArrowRight, Trash2, ShoppingBag, ArrowLeft, Package } from 'lucide-react';
import { formatCurrency } from '@/app/lib/utils';
import RemoveFromCartButton from '@/app/ui/shop/remove-from-cart-button'; // 👇 Crearemos este botón pequeño
import CheckoutButton from '@/app/ui/shop/checkout-button'; // 👇 Y este para pagar

export default async function CartPage() {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white-off dark:bg-neutral-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-dark dark:text-white">Debes iniciar sesión</h1>
          <Link href="/login" className="text-primary hover:underline">Ir al Login</Link>
        </div>
      </div>
    );
  }

  // Obtenemos carrito con los detalles del producto (Juego, Plataforma, etc.)
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: {
      cart: {
        include: {
          items: {
            include: {
              listing: {
                include: { game: true, platform: true, seller: true }
              }
            },
            orderBy: { addedAt: 'desc' }
          }
        }
      }
    }
  });

  const cartItems = user?.cart?.items || [];
  
  // Calcular Total
  const totalAmount = cartItems.reduce((sum, item) => sum + item.listing.price, 0);

  return (
    <div className="min-h-screen bg-white-off dark:bg-neutral-900 py-10 px-4 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-dark dark:text-white mb-8 flex items-center gap-3">
          <ShoppingBag className="text-primary" />
          Tu Carrito
        </h1>

        {cartItems.length === 0 ? (
          // CARRITO VACÍO
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-neutral-700 shadow-sm">
            <div className="w-20 h-20 bg-gray-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={40} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-dark dark:text-white mb-2">Tu carrito está vacío</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Parece que aún no has encontrado tu próximo juego.</p>
            <Link 
              href="/tienda" 
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold transition-transform hover:scale-105"
            >
              Explorar la Tienda <ArrowRight size={20} />
            </Link>
          </div>
        ) : (
          // CARRITO CON PRODUCTOS
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* LISTA DE ITEMS (Izquierda) */}
            <div className="flex-1 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-gray-200 dark:border-neutral-700 shadow-sm flex gap-4 transition-colors">
                  {/* Imagen */}
                  <div className="w-24 h-24 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={item.listing.game?.coverImage || '/placeholder.png'} 
                      alt="Juego" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg text-dark dark:text-white line-clamp-1">
                          {item.listing.game?.title}
                        </h3>
                        <p className="font-bold text-lg text-primary">
                          {formatCurrency(item.listing.price * 100)}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.listing.platform?.name} • {item.listing.condition}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Vendido por: {item.listing.seller?.name}
                      </p>
                    </div>

                    <div className="flex justify-end mt-2">
                       {/* Botón Cliente para eliminar */}
                       <RemoveFromCartButton itemId={item.id} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* RESUMEN DE PAGO (Derecha - Sticky) */}
            <div className="lg:w-96">
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-gray-200 dark:border-neutral-700 shadow-lg sticky top-24">
                <h3 className="text-xl font-bold text-dark dark:text-white mb-6">Resumen</h3>
                
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Subtotal ({cartItems.length} productos)</span>
                    <span>{formatCurrency(totalAmount * 100)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Envío estimado</span>
                    <span className="text-green-500 font-medium">Gratis</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-neutral-700 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg text-dark dark:text-white">Total</span>
                    <span className="font-bold text-2xl text-primary">{formatCurrency(totalAmount * 100)}</span>
                  </div>
                </div>

                {/* Botón de Pagar */}
                <CheckoutButton />
                
                <p className="text-xs text-gray-400 text-center mt-4 flex items-center justify-center gap-1">
                  <Package size={14} /> Garantía de compra segura Replay
                </p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}