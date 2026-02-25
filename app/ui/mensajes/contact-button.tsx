'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Loader2 } from 'lucide-react';
import { createOrGetChat } from '@/app/lib/actions';
import { showToast } from '@/app/lib/swal';

export default function ContactButton({ listingId, className = '' }: { listingId: string, className?: string }) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleContact = async () => {
    setIsPending(true);
    
    // Llamamos a la Server Action
    const result = await createOrGetChat(listingId);

    if (result.success && result.redirectUrl) {
      router.push(result.redirectUrl);
    } else {
      showToast('info', 'Inicia sesión', result.message || 'No se pudo iniciar el chat.');
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={handleContact}
      disabled={isPending}
      // 🟢 ESTILO ACTUALIZADO: 
      // 1. Quitamos scale-105
      // 2. Fondo blanco/oscuro con borde (Outline style) en vez de bloque sólido negro/blanco
      // 3. Hover suave con el color primario
      className={`
        w-full py-3 px-6 rounded-xl font-bold shadow-sm transition-colors duration-200
        flex items-center justify-center gap-2 
        border border-gray-200 dark:border-neutral-700
        bg-white dark:bg-neutral-800 
        text-dark dark:text-white
        
        hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary
        hover:bg-primary/5 dark:hover:bg-primary/10
        
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isPending ? (
        <Loader2 size={20} className="animate-spin" />
      ) : (
        <MessageCircle size={20} />
      )}
      <span>Contactar</span>
    </button>
  );
}