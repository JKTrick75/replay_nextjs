'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import ReviewModal from '@/app/ui/seller/review-modal';
import { useRouter } from 'next/navigation';

export default function RateOrderButton({ listingId }: { listingId: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full md:w-auto bg-primary hover:bg-primary-hover text-white font-bold py-2 px-6 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
      >
        <Star size={18} fill="currentColor" /> Valorar Pedido
      </button>

      <ReviewModal 
        listingId={listingId} 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          router.refresh(); // Refrescamos para ver la review publicada
        }} 
      />
    </>
  );
}