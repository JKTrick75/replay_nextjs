'use client';

import { removeFromCart } from '@/app/lib/actions';
import { Trash2, Loader2 } from 'lucide-react';
import { useTransition } from 'react';

export default function RemoveFromCartButton({ itemId }: { itemId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button 
      onClick={() => {
        startTransition(async () => {
          await removeFromCart(itemId);
        });
      }}
      disabled={isPending}
      className="text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
    >
      {isPending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
      Eliminar
    </button>
  );
}