'use client';

// 👇 CAMBIO: Usamos la función nueva que sí existe
import { processCheckout } from '@/app/lib/actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Loader2 } from 'lucide-react';

export default function CheckoutButton() {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    const confirmed = window.confirm("¿Confirmar compra simulada? Esto marcará los productos como vendidos.");
    if (!confirmed) return;

    setIsPending(true);
    
    // 👇 CAMBIO: Le pasamos una dirección por defecto al llamar a la acción
    const result = await processCheckout("Dirección rápida (Botón directo)");
    
    if (result.success) {
      alert("¡Compra realizada con éxito! 🎮");
      router.push('/dashboard/compras'); 
    } else {
      alert(result.message || "Hubo un error");
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={isPending}
      className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? <Loader2 className="animate-spin" /> : <CreditCard />}
      Tramitar Pedido
    </button>
  );
}