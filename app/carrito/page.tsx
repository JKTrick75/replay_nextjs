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

  if (!user || !user.cart || user.cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="bg-white dark:bg-neutral-800 rounded-3xl p-12 shadow-sm inline-block">
          <ShoppingBag size={64} className="mx-auto text-gray-300 mb-6" />
          <h1 className="text-3xl font-bold text-dark dark:text-white mb-4">Tu carrito está vacío</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
            ¡Parece que aún no has añadido nada! Explora nuestra tienda y encuentra las mejores ofertas en juegos retro.
          </p>
          <Link 
            href="/tienda" 
            className="bg-primary hover:bg-primary-hover text-white font-bold py-4 px-8 rounded-xl transition-all inline-flex items-center gap-2"
          >
            Ir a la tienda <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    );
  }

  // --- LÓGICA DE CÁLCULOS ---
  const allItems = user.cart.items;
  const selectedItems = allItems.filter(item => item.selected);
  const allSelected = allItems.length > 0 && allItems.every(item => item.selected);

  const subtotal = selectedItems.reduce((acc, item) => acc + item.listing.price, 0);
  
  const FREE_SHIPPING_THRESHOLD = 50;
  const shippingCost = 4.90;
  
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = (subtotal > 0 && isFreeShipping) ? 0 : (subtotal > 0 ? shippingCost : 0);
  
  const finalTotal = subtotal + shipping;

  const diff = FREE_SHIPPING_THRESHOLD - subtotal;
  const progressPercentage = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  return (
    <div className="min-h-screen bg-white-off dark:bg-neutral-900 pb-20">
      <div className="max-w-7xl mx-auto px-4 pt-8">
        <h1 className="text-3xl font-bold text-dark dark:text-white mb-8 flex items-center gap-3">
          Mi Carrito <span className="text-sm font-normal text-gray-400 bg-gray-100 dark:bg-neutral-800 px-3 py-1 rounded-full">{allItems.length}</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Izquierda: Productos */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm flex items-center justify-between border border-gray-100 dark:border-neutral-700">
              <div className="flex items-center gap-3">
                <SelectAllCheckbox allSelected={allSelected} />
                <span className="text-sm font-bold dark:text-white">Seleccionar todo</span>
              </div>
              <span className="text-xs text-gray-400">{selectedItems.length} seleccionados</span>
            </div>

            <div className="space-y-3">
              {allItems.map((item) => (
                <div key={item.id} className={`bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-sm border transition-all flex gap-4 relative group ${item.selected ? 'border-primary/30 ring-1 ring-primary/10' : 'border-gray-100 dark:border-neutral-700'}`}>
                  <div className="flex items-center">
                      <CartCheckbox id={item.id} isSelected={item.selected} />
                  </div>

                  <Link 
                    href={`/tienda/${item.listing.id}`}
                    className="w-24 h-24 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100 dark:border-neutral-700 block hover:opacity-90 transition-opacity"
                  >
                    <img 
                      src={item.listing.game.coverImage || '/placeholder-game.png'} 
                      alt={item.listing.game.title}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    {/* INFO PRINCIPAL */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-0">
                      <div>
                        <Link href={`/tienda/${item.listing.id}`} className="hover:text-primary transition-colors block">
                           <h3 className="font-bold text-dark dark:text-white truncate sm:pr-8">{item.listing.game.title}</h3>
                        </Link>
                        
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                          {item.listing.platform.name} • <span className="text-primary font-medium">{item.listing.condition}</span>
                        </p>
                      </div>
                      
                      <p className="font-black text-lg text-primary whitespace-nowrap mt-1 sm:mt-0">
                        {formatCurrency(item.listing.price * 100)}
                      </p>
                    </div>
                    
                    <div className="mt-2 mb-3 sm:mb-0 flex items-center gap-2">
                       <img src={item.listing.seller.image || `https://ui-avatars.com/api/?name=${item.listing.seller.name}`} className="w-5 h-5 rounded-full" alt="" />
                       <span className="text-[10px] text-gray-400">Vendido por <span className="font-bold">{item.listing.seller.name}</span></span>
                    </div>
                  </div>

                  <RemoveFromCartButton itemId={item.id} />
                </div>
              ))}
            </div>
          </div>

          {/* Columna Derecha: Resumen */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-neutral-700 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Truck className={subtotal >= 50 ? "text-green-500" : "text-primary"} size={20} />
                    <span className="font-bold text-sm dark:text-white">
                      {subtotal <= 0 
                        ? `¡Añade ${formatCurrency(50 * 100)} más para envío gratis!` 
                        : subtotal >= 50 
                          ? '¡Tienes envío gratis!' 
                          : `Te faltan ${formatCurrency(diff * 100)} para el envío gratis`
                      }
                    </span>
                  </div>
                  <span className="text-xs font-medium text-gray-400">{Math.round(progressPercentage)}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${subtotal >= 50 ? 'bg-green-500' : 'bg-primary'}`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-neutral-700">
                <h2 className="text-xl font-bold text-dark dark:text-white mb-6 pb-4 border-b border-gray-50 dark:border-neutral-700">Resumen</h2>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-gray-500 dark:text-gray-400">
                    <span>Subtotal ({selectedItems.length} art.)</span>
                    <span>{formatCurrency(subtotal * 100)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 dark:text-gray-400">
                    <span>Envío</span>
                    <span className={subtotal >= 50 ? "text-green-500 font-bold" : ""}>
                      {subtotal <= 0 ? formatCurrency(0) : (subtotal >= 50 ? 'Gratis' : formatCurrency(shippingCost * 100))}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-gray-50 dark:border-neutral-700 flex justify-between items-end">
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

        </div>
      </div>
    </div>
  );
}