'use client';

import { cancelOrder } from '@/app/lib/actions';
import { Ban, Loader2 } from 'lucide-react';
import { useTransition } from 'react';
import { confirmAction, showToast } from '@/app/lib/swal';

export default function CancelOrderButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleCancel = async () => {
    const result = await confirmAction(
      '¿Cancelar Pedido?',
      'Se reembolsará al comprador y el producto volverá a estar en venta. Esta acción no se puede deshacer.',
      'Sí, cancelar pedido'
    );

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
      // 👇 ESTILO SIDENAV "INACTIVO": Fondo blanco/neutro, texto gris, hover primario
      className={`
        flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors
        bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700
        text-gray-600 dark:text-gray-300
        hover:bg-gray-100 dark:hover:bg-neutral-700 hover:text-primary
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      title="Cancelar pedido y republicar"
    >
      {isPending ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Ban size={16} />
      )}
      <span>Cancelar Pedido</span>
    </button>
  );
}