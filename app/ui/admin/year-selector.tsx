'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { CalendarDays } from 'lucide-react';

export default function YearSelector() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  //Obtenemos el año de la URL o usamos el actual por defecto
  const currentYear = new Date().getFullYear();
  const selectedYear = Number(searchParams.get('year')) || currentYear;

  //Generamos lista de años
  const years = [];
  for (let i = 2024; i <= currentYear + 1; i++) {
    years.push(i);
  }

  const handleYearChange = (year: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('year', year);
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 bg-white dark:bg-neutral-800 p-2 rounded-lg border border-gray-200 dark:border-neutral-700 shadow-sm">
      <CalendarDays size={18} className="text-gray-500 ml-2" />
      <select
        value={selectedYear}
        onChange={(e) => handleYearChange(e.target.value)}
        className="bg-transparent border-none text-sm font-bold text-dark dark:text-white focus:ring-0 cursor-pointer outline-none pr-2"
      >
        {years.map((y) => (
          <option key={y} value={y} className="dark:bg-neutral-800">
            Año {y}
          </option>
        ))}
      </select>
    </div>
  );
}