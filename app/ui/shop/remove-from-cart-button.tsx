'use client';

import { removeFromCart } from '@/app/lib/actions';
import { Trash2, Loader2 } from 'lucide-react';
import { useTransition } from 'react';

export default function RemoveFromCartButton({ itemId }: { itemId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        // 👇 CORRECCIÓN: Envolvemos en async void para evitar el error de TS
        startTransition(async () => {
          await removeFromCart(itemId);
        });
      }}
      disabled={isPending}
      // 👇 ESTILO ETIQUETA: Posición absoluta, color corporativo y forma específica
      className="absolute bottom-0 right-0 flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded-tl-xl rounded-br-xl text-[10px] font-bold uppercase transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed z-10"
      title="Eliminar del carrito"
    >
      {isPending ? (
        <Loader2 size={12} className="animate-spin" />
      ) : (
        <Trash2 size={12} strokeWidth={2.5} />
      )}
      <span>Eliminar</span>
    </button>
  );
}