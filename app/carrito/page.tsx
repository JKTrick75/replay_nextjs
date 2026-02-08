import { auth } from '@/auth';
import { prisma } from '@/app/lib/db';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Package, CreditCard, Truck } from 'lucide-react';
import { formatCurrency } from '@/app/lib/utils';
import RemoveFromCartButton from '@/app/ui/shop/remove-from-cart-button';
import CartCheckbox from '@/app/ui/shop/cart-checkbox';
import SelectAllCheckbox from '@/app/ui/shop/select-all-checkbox';

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
  const areAllSelected = cartItems.length > 0 && cartItems.every(item => item.selected);

  // --- 💰 LÓGICA DE PRECIOS Y ENVÍO ---
  const selectedItems = cartItems.filter(item => item.selected);
  const subtotal = selectedItems.reduce((sum, item) => sum + item.listing.price, 0);
  const SHIPPING_COST = 4.99;
  const FREE_SHIPPING_THRESHOLD = 50.00;
  const shippingPrice = (subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD) ? SHIPPING_COST : 0;
  const finalTotal = subtotal + shippingPrice;

  return (
    <div className="min-h-screen bg-white-off dark:bg-neutral-900 py-10 px-4 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-dark dark:text-white mb-8 flex items-center gap-3">
          <ShoppingBag className="text-primary" />
          Tu Carrito
        </h1>

        {cartItems.length === 0 ? (
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
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* COLUMNA IZQUIERDA: ITEMS */}
            <div className="flex-1 space-y-4">
              
              {/* SELECCIONAR TODOS */}
              <div className="p-3 pl-4 rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 shadow-sm flex items-center gap-3 mb-2">
                 <div className="flex items-center justify-center pl-1">
                    <SelectAllCheckbox allSelected={areAllSelected} />
                 </div>
                 <span className="font-bold text-dark dark:text-white text-sm select-none cursor-pointer">
                    Seleccionar todos ({cartItems.length} artículos)
                 </span>
              </div>

              {/* LISTA DE ITEMS */}
              {cartItems.map((item) => (
                <div 
                  key={item.id} 
                  className={`relative p-4 pb-10 rounded-xl border shadow-sm flex gap-4 transition-all duration-200 items-start overflow-hidden group
                    ${item.selected 
                        ? 'bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700' 
                        : 'bg-gray-50 dark:bg-neutral-900/50 border-gray-100 dark:border-neutral-800 opacity-75'
                    }`}
                >
                  <div className="flex items-center justify-center pl-1 pt-2 shrink-0 z-20">
                    <CartCheckbox id={item.id} isSelected={item.selected} />
                  </div>

                  {/* 👇 ENVOLVEMOS IMAGEN Y TEXTO EN UN LINK */}
                  <Link 
                    href={`/tienda/${item.listing.id}`} 
                    className="flex flex-1 gap-4 min-w-0 hover:opacity-80 transition-opacity"
                  >
                      <div className="w-24 h-24 shrink-0 bg-gray-100 rounded-lg overflow-hidden relative">
                        {!item.selected && <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-10" />}
                        <img 
                          src={item.listing.game?.coverImage || '/placeholder.png'} 
                          alt="Juego" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between self-stretch py-1">
                        <div>
                          <div className="flex justify-between items-start gap-4">
                            <h3 className={`font-bold text-lg line-clamp-1 ${!item.selected ? 'text-gray-500' : 'text-dark dark:text-white'}`}>
                                {item.listing.game?.title}
                            </h3>
                            <p className={`font-bold text-lg shrink-0 ${item.selected ? 'text-primary' : 'text-gray-400'}`}>
                              {formatCurrency(item.listing.price * 100)}
                            </p>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {item.listing.platform?.name} • {item.listing.condition}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            Vendido por: {item.listing.seller?.name}
                          </p>
                        </div>
                      </div>
                  </Link>

                  {/* 👇 EL BOTÓN SE QUEDA FUERA DEL LINK, ABSOLUTO AL PADRE */}
                  <RemoveFromCartButton itemId={item.id} />
                </div>
              ))}
            </div>

            {/* COLUMNA DERECHA: RESUMEN (Sin cambios) */}
            <div className="lg:w-96">
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-gray-200 dark:border-neutral-700 shadow-lg sticky top-24">
                <h3 className="text-xl font-bold text-dark dark:text-white mb-6">Resumen del Pedido</h3>
                
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between items-center text-gray-600 dark:text-gray-300">
                    <span>Productos ({selectedItems.length}):</span>
                    <span>{formatCurrency(subtotal * 100)}</span>
                  </div>

                  <div className="flex justify-between items-center text-gray-600 dark:text-gray-300">
                    <span className="flex items-center gap-1">
                        Envío estimado 
                        {shippingPrice === 0 && subtotal > 0 && <Truck size={14} className="text-green-500"/>}
                    </span>
                    <span className={`font-medium ${shippingPrice === 0 ? 'text-green-500' : ''}`}>
                        {shippingPrice === 0 ? 'Gratis' : formatCurrency(shippingPrice * 100)}
                    </span>
                  </div>

                  {shippingPrice > 0 && (
                      <div className="text-xs text-primary bg-primary/5 p-2 rounded-md w-fit ml-auto border border-primary/10">
                        ¡Añade <b>{formatCurrency((FREE_SHIPPING_THRESHOLD - subtotal) * 100)}</b> más para envío gratis!
                      </div>
                  )}
                </div>

                <div className="border-t border-gray-200 dark:border-neutral-700 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg text-dark dark:text-white">Total</span>
                    <span className="font-bold text-2xl text-primary">{formatCurrency(finalTotal * 100)}</span>
                  </div>
                  <p className="text-right text-xs text-gray-400 mt-1">Impuestos incluidos</p>
                </div>

                {selectedItems.length > 0 ? (
                    <Link 
                      href="/checkout"
                      className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl shadow-lg transition-transform hover:scale-[1.02] flex justify-center items-center gap-2 text-center"
                    >
                      <CreditCard size={20} />
                      Tramitar Pedido
                    </Link>
                ) : (
                    <button 
                        disabled 
                        className="w-full bg-gray-300 dark:bg-neutral-700 text-gray-500 font-bold py-4 rounded-xl cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        Selecciona productos
                    </button>
                )}
                
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