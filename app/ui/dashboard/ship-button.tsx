'use client';

import { markAsShipped } from '@/app/lib/actions';
import { Truck, Loader2 } from 'lucide-react';
import { useTransition } from 'react';
import { confirmAction, showToast } from '@/app/lib/swal';

export default function ShipButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleShip = async () => {
    const result = await confirmAction(
      '¿Confirmar envío?', 
      'Avisaremos al comprador de que su paquete está en camino.',
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
      // 👇 ESTILO SIDENAV "ACTIVO": bg-primary text-white shadow-md
      className={`
        flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors
        bg-primary text-white shadow-md hover:bg-primary-hover
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      title="Marcar como enviado"
    >
      {isPending ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Truck size={16} />
      )}
      <span>Confirmar Envío</span>
    </button>
  );
}