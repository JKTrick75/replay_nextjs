'use client';

import { cancelOrder } from '@/app/lib/actions';
import { Ban, Loader2 } from 'lucide-react';
import { useTransition } from 'react';
import { confirmAction, showToast } from '@/app/lib/swal';
import { useRouter } from 'next/navigation';

export default function BuyerCancelButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCancel = async () => {
    const result = await confirmAction(
      '¿Cancelar tu compra?',
      'El pedido aún no ha sido enviado. Se te reembolsará el dinero inmediatamente.',
      'Sí, cancelar compra'
    );

    if (result.isConfirmed) {
      startTransition(async () => {
        const response = await cancelOrder(id);
        
        if (response.success) {
            showToast('success', 'Pedido Cancelado', 'Has recibido tu reembolso.');
            router.refresh();
        } else {
            showToast('error', 'No se pudo cancelar', response.message || 'Inténtalo de nuevo.');
        }
      });
    }
  };

  return (
    <button
      onClick={handleCancel}
      disabled={isPending}
      // 🟢 ESTILO: Neutro (Gris) por defecto -> Rojo al pasar el ratón
      className={`
        w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
        bg-white dark:bg-neutral-800 
        border border-gray-200 dark:border-neutral-700
        text-gray-600 dark:text-gray-300
        hover:border-red-200 hover:bg-red-50 hover:text-red-600 
        dark:hover:bg-red-900/20 dark:hover:border-red-800 dark:hover:text-red-400
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      title="Cancelar compra"
    >
      {isPending ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Ban size={16} />
      )}
      <span>{isPending ? 'Cancelando...' : 'Cancelar Compra'}</span>
    </button>
  );
}