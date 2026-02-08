import Swal, { SweetAlertIcon } from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// --- CONFIGURACIÓN BASE (ESTILOS) ---
export const showAlert = MySwal.mixin({
  customClass: {
    confirmButton: 'bg-[#E96B56] text-white px-6 py-2 rounded-lg font-bold mx-2 hover:bg-[#ee8b7a] transition-colors shadow-md',
    cancelButton: 'bg-gray-200 text-gray-600 px-6 py-2 rounded-lg font-bold mx-2 hover:bg-gray-300 transition-colors',
    // Estilos con !important para forzar el Dark Mode
    popup: 'rounded-2xl !bg-white dark:!bg-neutral-800 dark:!text-white border border-gray-100 dark:border-neutral-700 shadow-xl',
    title: '!text-dark dark:!text-white font-bold',
    htmlContainer: '!text-gray-600 dark:!text-gray-300',
  },
  buttonsStyling: false,
});

// --- ABSTRACCIÓN 1: TOASTS (NOTIFICACIONES) ---
// Úsalo para: Éxito al guardar, Error al login, Info rápida...
export const showToast = (
  icon: SweetAlertIcon, 
  title: string, 
  text: string = '', 
  afterClose?: () => void
) => {
  return showAlert.fire({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    icon: icon,
    title: title,
    text: text,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
    willClose: () => {
      if (afterClose) afterClose();
    }
  });
};

// --- ABSTRACCIÓN 2: CONFIRMACIONES (MODALES) ---
// Úsalo para: Borrar algo, Cancelar pedido, Acciones irreversibles
export const confirmAction = async (
  title: string, 
  text: string, 
  confirmText: string = 'Sí, continuar'
) => {
  return showAlert.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancelar',
    reverseButtons: true, // Botón de cancelar a la izquierda
    focusCancel: true,    // El foco empieza en cancelar por seguridad
  });
};