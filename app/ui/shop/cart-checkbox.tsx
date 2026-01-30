'use client';

import { toggleCartItemSelection } from '@/app/lib/actions';
import { useTransition } from 'react';
import { Check } from 'lucide-react'; // 👇 Necesitamos el icono

export default function CartCheckbox({ id, isSelected }: { id: string, isSelected: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    startTransition(async () => {
      await toggleCartItemSelection(id, checked);
    });
  };

  return (
    <label className={`relative flex items-center justify-center p-2 rounded-full cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800 ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={handleChange}
        disabled={isPending}
        className="peer sr-only" // 👈 Ocultamos el input nativo visualmente
      />
      
      {/* 👇 Este es el DIV que dibuja el checkbox bonito */}
      <div className={`
        w-6 h-6 border-2 rounded-md transition-all duration-200 flex items-center justify-center
        ${isSelected 
          ? 'bg-primary border-primary shadow-sm scale-110' 
          : 'bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-600 hover:border-primary'}
      `}>
        {/* El icono solo se ve si está seleccionado */}
        <Check 
          size={14} 
          strokeWidth={3}
          className={`text-white transition-transform duration-200 ${isSelected ? 'scale-100' : 'scale-0'}`} 
        />
      </div>
    </label>
  );
}