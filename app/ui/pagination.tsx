'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { generatePagination } from '@/app/lib/utils';

export default function Pagination({ 
  totalPages, 
  paramName = 'page' 
}: { 
  totalPages: number,
  paramName?: string 
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get(paramName)) || 1;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set(paramName, pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const allPages = generatePagination(currentPage, totalPages);

  return (
    <div className="inline-flex">
      <PaginationArrow
        direction="left"
        href={createPageURL(currentPage - 1)}
        isDisabled={currentPage <= 1}
      />

      <div className="flex -space-x-px">
        {allPages.map((page, index) => {
          let position: 'first' | 'last' | 'single' | 'middle' | undefined;

          if (index === 0) position = 'first';
          if (index === allPages.length - 1) position = 'last';
          if (allPages.length === 1) position = 'single';
          if (page === '...') position = 'middle';

          return (
            <PaginationNumber
              key={`${page}-${index}`}
              href={createPageURL(page)}
              page={page}
              position={position}
              isActive={currentPage === page}
            />
          );
        })}
      </div>

      <PaginationArrow
        direction="right"
        href={createPageURL(currentPage + 1)}
        isDisabled={currentPage >= totalPages}
      />
    </div>
  );
}

function PaginationNumber({
  page,
  href,
  isActive,
  position,
}: {
  page: number | string;
  href: string;
  position?: 'first' | 'last' | 'middle' | 'single';
  isActive: boolean;
}) {
  const className = clsx(
    'flex h-10 w-10 items-center justify-center text-sm border',
    {
      'rounded-l-md': position === 'first' || position === 'single',
      'rounded-r-md': position === 'last' || position === 'single',
      'z-10 bg-primary border-primary text-white': isActive,
      'bg-white dark:bg-neutral-800 border-gray-light dark:border-neutral-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-700':
        !isActive && position !== 'middle',
      'text-gray-300': position === 'middle',
    },
  );

  return isActive || position === 'middle' ? (
    <div className={className}>{page}</div>
  ) : (
    <Link href={href} className={className} scroll={false}>
      {page}
    </Link>
  );
}

function PaginationArrow({
  href,
  direction,
  isDisabled,
}: {
  href: string;
  direction: 'left' | 'right';
  isDisabled?: boolean;
}) {
  const className = clsx(
    'flex h-10 w-10 items-center justify-center rounded-md border border-gray-light dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-500 transition-colors',
    {
      'pointer-events-none text-gray-300 dark:text-neutral-600': isDisabled,
      'hover:bg-gray-100 dark:hover:bg-neutral-700 hover:text-dark dark:hover:text-white': !isDisabled,
      'mr-2': direction === 'left',
      'ml-2': direction === 'right',
    },
  );

  return isDisabled ? (
    <div className={className}>{direction === 'left' ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}</div>
  ) : (
    <Link className={className} href={href} scroll={false}>
      {direction === 'left' ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
    </Link>
  );
}