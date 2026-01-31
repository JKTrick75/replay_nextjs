'use client';

import { deleteListing } from '@/app/lib/actions';
import { Trash2, Loader2 } from 'lucide-react';
import { useTransition } from 'react';
// 👇 Importamos las funciones simplificadas
import { confirmAction, showToast } from '@/app/lib/swal';

export function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    // 1. Preguntamos con el modal bonito
    const result = await confirmAction(
      '¿Eliminar anuncio?',
      'Esta acción no se puede deshacer y el producto dejará de estar visible.'
    );

    // 2. Si dice que sí...
    if (result.isConfirmed) {
      startTransition(async () => {
        const response = await deleteListing(id);
        
        // 3. Mostramos el resultado
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