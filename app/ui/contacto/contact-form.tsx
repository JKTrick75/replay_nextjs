'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { createReport } from '@/app/lib/actions';
import { showToast } from '@/app/lib/swal';
import { Info, Send, MessageSquare, AlertCircle, ChevronDown } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full flex justify-center items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${pending ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {pending ? <span className="animate-pulse">Enviando ticket...</span> : <><Send size={18} /> Enviar Mensaje a Soporte</>}
    </button>
  );
}

export default function ContactForm({ initialAsunto, initialId, orders }: { initialAsunto: string, initialId: string, orders: any[] }) {
  const initialState = { message: null, errors: {} };
  // AHORA USAMOS useActionState (El estándar de React 19 / Next 15+)
  const [state, dispatch] = useActionState(createReport, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // Estado para controlar qué categoría está seleccionada
  const [selectedSubject, setSelectedSubject] = useState(initialAsunto === 'pedido' ? 'Problema con un pedido' : '');

  useEffect(() => {
    if (state?.success) {
      showToast('success', '¡Recibido!', state.message || 'Ticket enviado correctamente.');
      formRef.current?.reset();
      setSelectedSubject(''); // Reseteamos la vista
    } else if (state?.message && !state?.errors) {
      showToast('error', 'Error', state.message);
    }
  }, [state]);

  return (
    <div className="w-full max-w-2xl bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-gray-200 dark:border-neutral-700 overflow-hidden animate-fade-in">
      <div className="bg-gray-50 dark:bg-neutral-900 p-6 md:p-8 border-b border-gray-200 dark:border-neutral-700 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
          <Info size={32} className="text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-dark dark:text-white">Centro de Soporte</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          ¿Tienes algún problema con un pedido o una duda técnica? Rellena este formulario y te ayudaremos enseguida.
        </p>
      </div>

      <div className="p-6 md:p-8">
        <form ref={formRef} action={dispatch} className="space-y-6">
          
          {/* Campo: Tipo de Duda */}
          <div>
            <label htmlFor="subject" className="mb-2 block text-sm font-bold text-dark dark:text-white">
              ¿En qué podemos ayudarte?
            </label>
            <div className="relative">
              <select
                id="subject"
                name="subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="peer block w-full appearance-none rounded-xl border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 py-3 pl-4 pr-10 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:text-white transition-colors"
              >
                <option value="" disabled>Selecciona una categoría...</option>
                <option value="Problema con un pedido">Problema con un pedido</option>
                <option value="Duda técnica">Duda técnica / Error en la web</option>
                <option value="Reportar usuario">Reportar a un usuario/anuncio</option>
                <option value="Sugerencia">Sugerencia de mejora</option>
                <option value="Otros">Otros</option>
              </select>
              <ChevronDown className="absolute right-4 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
            {state?.errors?.subject && (
              <p className="mt-2 text-sm text-red-500 flex items-center gap-1"><AlertCircle size={14} /> {state.errors.subject[0]}</p>
            )}
          </div>

          {/* Campo: Seleccionar Pedido (SOLO VISIBLE SI ES "Problema con un pedido") */}
          {selectedSubject === 'Problema con un pedido' && (
            <div className="animate-fade-in">
              <label htmlFor="listingId" className="mb-2 block text-sm font-bold text-dark dark:text-white">
                Selecciona el pedido afectado
              </label>
              <div className="relative">
                <select
                  id="listingId"
                  name="listingId"
                  defaultValue={initialId}
                  className="peer block w-full appearance-none rounded-xl border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 py-3 pl-4 pr-10 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:text-white transition-colors"
                >
                  <option value="">No aplica / No lo encuentro en la lista</option>
                  {orders.map((order) => (
                    <option key={order.id} value={order.id}>
                      [{order.id.slice(0, 8).toUpperCase()}] - {order.game.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Campo: Mensaje */}
          <div>
            <label htmlFor="message" className="mb-2 block text-sm font-bold text-dark dark:text-white">
              Detalles del problema
            </label>
            <div className="relative">
              <textarea
                id="message"
                name="message"
                rows={5}
                placeholder="Por favor, incluye toda la información posible para que podamos ayudarte mejor."
                className="peer block w-full rounded-xl border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:text-white transition-colors resize-none"
              ></textarea>
              <MessageSquare className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
            {state?.errors?.message && (
              <p className="mt-2 text-sm text-red-500 flex items-center gap-1"><AlertCircle size={14} /> {state.errors.message[0]}</p>
            )}
          </div>

          <div className="pt-2">
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}