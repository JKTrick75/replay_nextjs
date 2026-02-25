'use client';

import { deleteListing } from '@/app/lib/actions';
import { Trash2, Loader2 } from 'lucide-react';
import { useTransition } from 'react';
import { confirmAction, showToast } from '@/app/lib/swal';

export function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    const result = await confirmAction(
      '¿Eliminar anuncio?',
      'Esta acción no se puede deshacer y el producto dejará de estar visible.'
    );

    if (result.isConfirmed) {
      startTransition(async () => {
        const response = await deleteListing(id);
        
        if (response.message === 'Anuncio eliminado.') {
             showToast('success', '¡Eliminado!', 'El anuncio se ha borrado correctamente.');
        } else {
             showToast('error', 'Error', response.message);
        }
      });
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      className="p-2 rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
      title="Eliminar anuncio"
    >
      {isPending ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <Trash2 size={18} />
      )}
    </button>
  );
}