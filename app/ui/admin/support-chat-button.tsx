'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Loader2 } from 'lucide-react';
import { createOrGetSupportChat } from '@/app/lib/actions';
import { showToast } from '@/app/lib/swal';

export default function SupportChatButton({ userId, reportId, listingId }: { userId: string, reportId: string, listingId?: string | null }) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleContact = async () => {
    setIsPending(true);
    
    // Pasamos el reportId a la función
    const result = await createOrGetSupportChat(userId, reportId, listingId);

    if (result.success && result.redirectUrl) {
      router.push(result.redirectUrl);
    } else {
      showToast('error', 'Error', result.message || 'No se pudo iniciar el chat.');
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={handleContact}
      disabled={isPending}
      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors font-medium text-sm mt-3 shadow-sm"
    >
      {isPending ? <Loader2 size={18} className="animate-spin" /> : <MessageCircle size={18} />}
      Iniciar Chat con Usuario
    </button>
  );
}