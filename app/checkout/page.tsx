import { auth } from '@/auth';
import { prisma } from '@/app/lib/db';
import { redirect } from 'next/navigation';
import CheckoutForm from '@/app/ui/shop/checkout-form';
import { MapPin, Package } from 'lucide-react';
import { formatCurrency } from '@/app/lib/utils';

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user?.email) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      cart: {
        include: {
          items: {
            include: { listing: { include: { game: true } } }
          }
        }
      }
    }
  });

  // Si no hay carrito, fuera
  if (!user || !user.cart) {
    redirect('/carrito');
  }

  // 👇 1. FILTRADO: Solo procesamos los items con el checkbox activado
  const selectedItems = user.cart.items.filter(item => item.selected);

  // Si no hay nada seleccionado, volvemos al carrito
  if (selectedItems.length === 0) {
    redirect('/carrito');
  }

  // 👇 2. CÁLCULOS: Subtotal, Envío y Total
  const subtotal = selectedItems.reduce((sum, item) => sum + item.listing.price, 0);
  
  const SHIPPING_COST = 4.99;
  const FREE_SHIPPING_THRESHOLD = 50.00;
  
  // Regla: Envío gratis si supera 50€
  const shippingPrice = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const finalTotal = subtotal + shippingPrice;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 py-12 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: FORMULARIO DE ENVÍO */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-700">
            <h2 className="text-xl font-bold text-dark dark:text-white mb-4 flex items-center gap-2">
              <MapPin className="text-primary" />
              Dirección de Envío
            </h2>
            
            <CheckoutForm 
              userCity={user.city} 
              userAddressDefault={`${user.city || ''}`} 
            />
          </div>
        </div>

        {/* COLUMNA DERECHA: RESUMEN */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-700 sticky top-24">
            <h3 className="font-bold text-lg mb-4 text-dark dark:text-white">Resumen del Pedido</h3>
            
            {/* LISTA DE ITEMS (Solo seleccionados) */}
            <div className="space-y-3 mb-6 border-b border-gray-100 dark:border-neutral-700 pb-6">
              {selectedItems.map(item => (
                <div key={item.id} className="flex justify-between text-sm items-start gap-2">
                   <span className="text-gray-600 dark:text-gray-400 line-clamp-1">{item.listing.game?.title}</span>
                   <span className="font-medium shrink-0">{formatCurrency(item.listing.price * 100)}</span>
                </div>
              ))}
            </div>

            {/* DESGLOSE ECONÓMICO */}
            <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal * 100)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-500">
                    <span>Envío</span>
                    <span className={shippingPrice === 0 ? 'text-green-500 font-bold' : ''}>
                        {shippingPrice === 0 ? 'Gratis' : formatCurrency(shippingPrice * 100)}
                    </span>
                </div>
            </div>

            <div className="border-t border-gray-200 dark:border-neutral-700 pt-4 flex justify-between items-center mb-4">
               <span className="font-bold text-xl text-dark dark:text-white">Total</span>
               <span className="font-bold text-2xl text-primary">{formatCurrency(finalTotal * 100)}</span>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-xs text-blue-700 dark:text-blue-300 flex gap-2">
               <Package size={16} className="shrink-0" />
               <span>Al confirmar, aceptas simular este pedido. No se realizará ningún cargo real.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}