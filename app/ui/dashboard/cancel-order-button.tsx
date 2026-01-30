'use client';

import { cancelOrder } from '@/app/lib/actions';
import { XCircle, Loader2 } from 'lucide-react';
import { useTransition } from 'react';

export default function CancelOrderButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (confirm('¿Seguro que quieres cancelar este pedido? Se reembolsará al comprador y el producto volverá a estar en venta.')) {
          // 👇 CORRECCIÓN: Igual aquí, async/await y llaves
          startTransition(async () => {
            await cancelOrder(id);
          });
        }
      }}
      disabled={isPending}
      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
      title="Cancelar pedido y republicar"
    >
      {isPending ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
    </button>
  );
}