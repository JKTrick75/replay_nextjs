'use client';

import { toggleAllCartItems } from '@/app/lib/actions';
import { useTransition } from 'react';
import { Check } from 'lucide-react';

export default function SelectAllCheckbox({ allSelected }: { allSelected: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleChange = () => {
    // Si ya están todos seleccionados, la acción será desmarcar (false). Si no, marcar (true).
    const newState = !allSelected;
    
    startTransition(async () => {
      await toggleAllCartItems(newState);
    });
  };

  return (
    <label className={`relative flex items-center justify-center p-2 rounded-full cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800 ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <input
        type="checkbox"
        checked={allSelected}
        onChange={handleChange}
        disabled={isPending}
        className="peer sr-only"
      />
      
      <div className={`
        w-6 h-6 border-2 rounded-md transition-all duration-200 flex items-center justify-center
        ${allSelected 
          ? 'bg-primary border-primary shadow-sm scale-110' 
          : 'bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-600 hover:border-primary'}
      `}>
        <Check 
          size={14} 
          strokeWidth={3}
          className={`text-white transition-transform duration-200 ${allSelected ? 'scale-100' : 'scale-0'}`} 
        />
      </div>
    </label>
  );
}