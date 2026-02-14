'use client';

import { markAsShipped } from '@/app/lib/actions';
import { Truck, Loader2, Send } from 'lucide-react';
import { useTransition } from 'react';
import { confirmAction, showToast } from '@/app/lib/swal';
import { useRouter } from 'next/navigation';

export default function ShipButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleShip = async () => {
    const result = await confirmAction(
      '¿Marcar como enviado?',
      'Haz esto solo si ya has entregado el paquete a la empresa de mensajería.',
      'Sí, ya está enviado'
    );

    if (result.isConfirmed) {
      startTransition(async () => {
        const response = await markAsShipped(id);
        
        if (response.success) {
            showToast('success', '¡Enviado!', 'Hemos avisado al comprador.');
            router.refresh();
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
      // 🟢 CAMBIO: Shadow suave (sm) en lugar de md, sin colores extraños
      className={`
        flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm
        bg-primary hover:bg-primary-hover text-white
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      title="Marcar pedido como enviado"
    >
      {isPending ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <Send size={18} />
      )}
      <span>{isPending ? 'Procesando...' : 'Marcar como Enviado'}</span>
    </button>
  );
}