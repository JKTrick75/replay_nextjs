import { auth } from '@/auth';
import { prisma } from '@/app/lib/db';
import { redirect } from 'next/navigation';
import CheckoutForm from '@/app/ui/shop/checkout-form'; // Componente cliente que crearemos abajo
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

  if (!user || !user.cart || user.cart.items.length === 0) {
    redirect('/carrito');
  }

  const totalAmount = user.cart.items.reduce((sum, item) => sum + item.listing.price, 0);

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
            
            {/* Formulario Cliente para elegir dirección y confirmar */}
            <CheckoutForm 
              userCity={user.city} 
              userAddressDefault={`${user.city || ''}`} // Podríamos guardar calle en perfil en el futuro
            />
          </div>
        </div>

        {/* COLUMNA DERECHA: RESUMEN */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-700 sticky top-24">
            <h3 className="font-bold text-lg mb-4 text-dark dark:text-white">Resumen del Pedido</h3>
            
            <div className="space-y-3 mb-6">
              {user.cart.items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                   <span className="text-gray-600 dark:text-gray-400 truncate max-w-37.5">{item.listing.game?.title}</span>
                   <span className="font-medium">{formatCurrency(item.listing.price * 100)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 dark:border-neutral-700 pt-4 flex justify-between items-center mb-4">
               <span className="font-bold text-xl">Total</span>
               <span className="font-bold text-2xl text-primary">{formatCurrency(totalAmount * 100)}</span>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-xs text-blue-700 dark:text-blue-300 flex gap-2">
               <Package size={16} className="shrink-0" />
               Al confirmar, aceptas simular este pedido. No se realizará ningún cargo real.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}