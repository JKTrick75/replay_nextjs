'use client';

import { CheckCircle } from 'lucide-react';
import { resolveReport } from '@/app/lib/actions';
import { confirmAction, showToast } from '@/app/lib/swal';
import { useState } from 'react';

export default function ResolveTicketButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  const handleResolve = async () => {
    const confirm = await confirmAction(
      '¿Cerrar ticket?',
      'Se marcará como resuelto y desaparecerá de los pendientes.',
      'Sí, cerrar'
    );

    if (confirm.isConfirmed) {
      setLoading(true);
      const res = await resolveReport(id);
      if (res.success) {
        showToast('success', 'Éxito', res.message);
      } else {
        showToast('error', 'Error', res.message || 'Error al cerrar.');
      }
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleResolve}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-colors shadow-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <CheckCircle size={18} />
      {loading ? 'Cerrando...' : 'Marcar como Resuelto'}
    </button>
  );
}