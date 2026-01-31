'use client';

import { cancelOrder } from '@/app/lib/actions';
import { XCircle, Loader2 } from 'lucide-react';
import { useTransition } from 'react';
import { confirmAction, showToast } from '@/app/lib/swal';

export default function CancelOrderButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleCancel = async () => {
    // 1. Confirmación de seguridad
    const result = await confirmAction(
      '¿Cancelar Pedido?',
      'Se reembolsará al comprador y el producto volverá a estar en venta. Esta acción no se puede deshacer.',
      'Sí, cancelar pedido'
    );

    // 2. Si confirma, procedemos
    if (result.isConfirmed) {
      startTransition(async () => {
        const response = await cancelOrder(id);
        
        if (response.success) {
            showToast('success', 'Pedido Cancelado', 'El producto vuelve a estar disponible en la tienda.');
        } else {
            showToast('error', 'Error', response.message || 'No se pudo cancelar.');
        }
      });
    }
  };

  return (
    <button
      onClick={handleCancel}
      disabled={isPending}
      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
      title="Cancelar pedido y republicar"
    >
      {isPending ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
    </button>
  );
}