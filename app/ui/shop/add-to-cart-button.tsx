'use client';

import { useState } from 'react';
import { ShoppingCart, Check, Loader2, XCircle } from 'lucide-react';
import { addToCart } from '@/app/lib/actions';
import { useRouter } from 'next/navigation';

export default function AddToCartButton({ listingId }: { listingId: string }) {
  const [isPending, setIsPending] = useState(false);
  const [feedback, setFeedback] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleAddToCart = async () => {
    setIsPending(true);
    setFeedback('idle');
    
    const result = await addToCart(listingId);
    
    setIsPending(false);

    if (result.success) {
      setFeedback('success');
      router.refresh(); // Actualiza el Navbar para que aparezca el numerito
      // Volver al estado normal después de 2 segundos
      setTimeout(() => setFeedback('idle'), 2000);
    } else {
      // 👇 MEJORA: Si el error es de sesión, redirigimos
      if (result.message && result.message.includes('Inicia sesión')) {
         router.push('/login');
         return;
      }
      setFeedback('error');
      setErrorMessage(result.message || 'Error al añadir');
      setTimeout(() => setFeedback('idle'), 3000);
    }
  };

  // Clases base del botón
  const baseClasses = "flex-1 sm:flex-none px-6 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 min-w-[140px]";

  if (feedback === 'success') {
    return (
      <button disabled className={`${baseClasses} bg-green-500 text-white`}>
        <Check size={20} />
        ¡Añadido!
      </button>
    );
  }

  if (feedback === 'error') {
    return (
      <button disabled className={`${baseClasses} bg-red-500 text-white`}>
        <XCircle size={20} />
        {errorMessage}
      </button>
    );
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isPending}
      className={`${baseClasses} bg-dark dark:bg-white text-white dark:text-dark hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isPending ? (
        <>
          <Loader2 size={20} className="animate-spin" />
          Añadiendo...
        </>
      ) : (
        <>
          <ShoppingCart size={20} />
          Añadir
        </>
      )}
    </button>
  );
}