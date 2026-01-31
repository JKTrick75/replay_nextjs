'use client';

import { markAsShipped } from '@/app/lib/actions';
import { Truck, Loader2 } from 'lucide-react';
import { useTransition } from 'react';
import { confirmAction, showToast } from '@/app/lib/swal';

export default function ShipButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleShip = async () => {
    // 1. Confirmación
    const result = await confirmAction(
      '¿Confirmar envío?', 
      'Esto avisará al comprador de que el paquete está en camino.',
      'Sí, enviado'
    );

    if (result.isConfirmed) {
      startTransition(async () => {
        const response = await markAsShipped(id);
        
        if (response.success) {
            showToast('success', '¡Enviado!', 'El estado del pedido se ha actualizado.');
        } else {
            showToast('error', 'Error', response.message || 'No se pudo actualizar.');
        }
      });
    }
  };

  return (
    <button
      onClick={handleShip}
      disabled={isPending}
      className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-md text-xs font-bold transition-colors disabled:opacity-50"
      title="Marcar como enviado"
    >
      {isPending ? <Loader2 size={14} className="animate-spin" /> : <Truck size={14} />}
      Enviar
    </button>
  );
}