'use client';

import { useTransition } from 'react';
import { confirmDelivery } from '@/app/lib/actions';
import { PackageCheck, Loader2, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { confirmAction, showToast } from '@/app/lib/swal';

export default function ConfirmDeliveryButton({ listingId }: { listingId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleConfirm = async () => {
    //Confirmación de seguridad
    const result = await confirmAction(
        '¿Todo correcto?', 
        'Confirma solo si tienes el producto en tus manos y funciona correctamente.',
        'Sí, confirmar recepción'
    );

    if (!result.isConfirmed) return;

    startTransition(async () => {
      const response = await confirmDelivery(listingId);
      
      if (response.success) {
        showToast('success', '¡Disfruta tu juego!', 'Has confirmado la recepción.');

        router.refresh();
      } else {
        showToast('error', 'Error', response.message || "Hubo un error.");
      }
    });
  };

  return (
    <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-100 dark:border-neutral-700 shadow-sm mt-3">
        <h4 className="font-bold text-dark dark:text-white mb-2 flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
              <PackageCheck size={20} />
          </div>
          Confirmar Recepción
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
          Solo pulsa este botón cuando tengas el juego en tus manos. Esto liberará el pago al vendedor.
        </p>
        
        <button
          onClick={handleConfirm}
          disabled={isPending}
          className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Confirmando...
            </>
          ) : (
            <>
              <CheckCircle2 size={20} />
              Confirmar que lo he recibido
            </>
          )}
        </button>
    </div>
  );
}