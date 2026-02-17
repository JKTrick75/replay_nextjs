'use client';

import { useState, useTransition } from 'react';
import { createReview } from '@/app/lib/actions';
import { X, MessageSquare, Send } from 'lucide-react';
import StarRating from '@/app/ui/seller/star-rating'; 
import { showToast } from '@/app/lib/swal';

export default function ReviewModal({ 
  listingId, 
  isOpen, 
  onClose 
}: { 
  listingId: string, 
  isOpen: boolean, 
  onClose: () => void 
}) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      // 1. Llamamos a la Server Action manualmente
      // Pasamos 'null' como prevState porque createReview lo espera
      const result = await createReview(null as any, formData);

      if (result.success) {
        // 2. ÉXITO: Mostramos alerta Y LUEGO cerramos
        showToast('success', '¡Gracias por tu valoración!', 'Tu opinión ayuda a la comunidad.');
        onClose(); 
      } else {
        // 3. ERROR: Mostramos el mensaje en el formulario
        setErrorMessage(result.message || 'Ha ocurrido un error.');
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 dark:border-neutral-700 overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/50">
          <h3 className="font-bold text-lg text-dark dark:text-white flex items-center gap-2">
            <MessageSquare size={18} className="text-primary" />
            Valorar Vendedor
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-dark dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Usamos onSubmit en lugar de action={formAction} */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <input type="hidden" name="listingId" value={listingId} />

          <div className="flex flex-col items-center gap-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
              Puntúa tu experiencia
            </label>
            <StarRating />
          </div>

          <div>
            <label className="block text-sm font-bold text-dark dark:text-gray-200 mb-2">
              Comentario (Opcional)
            </label>
            <textarea
              name="comment"
              rows={3}
              placeholder="El producto llegó perfecto, vendedor recomendado..."
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-dark dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none placeholder-gray-400"
            />
          </div>

          {errorMessage && (
            <div className="text-red-500 text-sm text-center font-medium bg-red-50 dark:bg-red-900/10 p-2 rounded-lg">
              {errorMessage}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
            >
              Más tarde
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-hover shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPending ? 'Enviando...' : 'Publicar'} <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}