'use client';

import { useState, useTransition } from 'react';
import { confirmDelivery } from '@/app/lib/actions';
import { PackageCheck, Loader2, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { confirmAction, showToast } from '@/app/lib/swal';

export default function DeliveryStatusButton({ listingId }: { listingId: string }) {
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleConfirm = async () => {
    // 1. Pregunta de seguridad
    const result = await confirmAction(
        '¿Todo correcto?', 
        'Confirma solo si tienes el producto en tus manos y funciona correctamente.',
        'Sí, confirmar recepción'
    );

    if (!result.isConfirmed) return;

    startTransition(async () => {
      const response = await confirmDelivery(listingId);
      
      if (response.success) {
        setIsSuccess(true);
        showToast('success', '¡Disfruta tu juego!', 'Has confirmado la recepción del pedido.');
        router.refresh();
      } else {
        showToast('error', 'Error', response.message || "Hubo un error al confirmar.");
      }
    });
  };

  if (isSuccess) {
    return (
      <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 dark:bg-green-900/20 dark:text-green-400 p-4 rounded-xl animate-in fade-in">
        <CheckCircle2 size={24} />
        <span>¡Entrega confirmada con éxito!</span>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
      <h4 className="font-bold text-dark dark:text-white mb-2 flex items-center gap-2">
        <PackageCheck className="text-primary" />
        Confirmar Recepción
      </h4>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Solo pulsa este botón cuando tengas el juego en tus manos y hayas verificado que funciona.
        Esto cerrará el pedido definitivamente.
      </p>
      
      <button
        onClick={handleConfirm}
        disabled={isPending}
        className="w-full sm:w-auto bg-dark dark:bg-white text-white dark:text-dark px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Confirmando...
          </>
        ) : (
          <>
            <PackageCheck size={20} />
            Confirmar que lo he recibido
          </>
        )}
      </button>
    </div>
  );
}