'use client';

import { useState } from 'react';
import { processCheckout } from '@/app/lib/actions'; // Nueva acción que crearemos
import { Loader2, CreditCard, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CheckoutForm({ userCity, userAddressDefault }: { userCity: string | null, userAddressDefault: string }) {
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  const [customAddress, setCustomAddress] = useState('');
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    // Decidimos qué dirección enviar
    const finalAddress = useCustomAddress ? customAddress : (userAddressDefault || "Dirección desconocida");

    if (useCustomAddress && customAddress.trim().length < 5) {
      alert("Por favor, escribe una dirección válida.");
      setIsPending(false);
      return;
    }

    const result = await processCheckout(finalAddress);

    if (result.success) {
      router.push('/dashboard/compras');
    } else {
      alert(result.message);
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleCheckout} className="space-y-6">
      
      {/* OPCIÓN A: Usar dirección del perfil */}
      <div 
        onClick={() => setUseCustomAddress(false)}
        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
          !useCustomAddress 
            ? 'border-primary bg-primary/5 dark:bg-primary/10' 
            : 'border-gray-200 dark:border-neutral-700 hover:border-gray-300'
        }`}
      >
        <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${!useCustomAddress ? 'border-primary' : 'border-gray-400'}`}>
          {!useCustomAddress && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
        </div>
        <div>
          <p className="font-bold text-dark dark:text-white">Usar mi ubicación de perfil</p>
          <p className="text-gray-500 text-sm">{userCity ? `Enviar a: ${userCity}` : 'No tienes ciudad definida en tu perfil.'}</p>
        </div>
      </div>

      {/* OPCIÓN B: Otra dirección */}
      <div 
        onClick={() => setUseCustomAddress(true)}
        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
          useCustomAddress 
            ? 'border-primary bg-primary/5 dark:bg-primary/10' 
            : 'border-gray-200 dark:border-neutral-700 hover:border-gray-300'
        }`}
      >
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${useCustomAddress ? 'border-primary' : 'border-gray-400'}`}>
             {useCustomAddress && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
          </div>
          <p className="font-bold text-dark dark:text-white">Enviar a otra dirección</p>
        </div>

        {/* Input condicional */}
        {useCustomAddress && (
          <textarea
            required
            value={customAddress}
            onChange={(e) => setCustomAddress(e.target.value)}
            placeholder="Calle, Número, Piso, Código Postal, Ciudad..."
            className="w-full mt-2 p-3 rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            rows={2}
          />
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99] flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
      >
        {isPending ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
        Confirmar y Pagar
      </button>

    </form>
  );
}