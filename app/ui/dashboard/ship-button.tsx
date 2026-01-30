'use client';

import { markAsShipped } from '@/app/lib/actions';
import { Truck, Loader2 } from 'lucide-react';
import { useTransition } from 'react';

export default function ShipButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (confirm('¿Confirmas que has enviado el paquete?')) {
          // 👇 CORRECCIÓN: Usamos async/await y llaves para no devolver nada
          startTransition(async () => {
            await markAsShipped(id);
          });
        }
      }}
      disabled={isPending}
      className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-xs font-bold transition-colors disabled:opacity-50"
      title="Marcar como enviado"
    >
      {isPending ? <Loader2 size={14} className="animate-spin" /> : <Truck size={14} />}
      Enviar
    </button>
  );
}