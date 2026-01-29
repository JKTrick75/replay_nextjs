'use client';

import { Trash2 } from 'lucide-react';
import { deleteListing } from '@/app/lib/actions';

export function DeleteButton({ id }: { id: string }) {
  const handleDelete = async () => {
    if (confirm('¿Seguro que quieres borrar este anuncio?')) {
      await deleteListing(id);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      className="p-2 rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors"
      title="Eliminar anuncio"
    >
      <Trash2 size={18} />
    </button>
  );
}