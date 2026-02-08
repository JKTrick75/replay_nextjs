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
      // 👇 ESTILO EXACTO AL DEL VENDEDOR (Neutro + Hover Primary)
      className={`
        flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors
        bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700
        text-gray-600 dark:text-gray-300
        hover:bg-gray-100 dark:hover:bg-neutral-700 hover:text-primary
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      title="Cancelar compra"
    >
      {isPending ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Ban size={16} />
      )}
      <span>Cancelar Compra</span>
    </button>
  );
}