import Swal, { SweetAlertIcon, SweetAlertInput } from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// --- CONFIGURACIÓN BASE (ESTILOS COMUNES) ---
const baseStyles = {
  confirmButton: 'bg-[#E96B56] text-white px-6 py-2 rounded-lg font-bold mx-2 hover:bg-[#ee8b7a] transition-colors shadow-md',
  cancelButton: 'bg-gray-200 text-gray-600 px-6 py-2 rounded-lg font-bold mx-2 hover:bg-gray-300 transition-colors',
  popup: 'rounded-2xl !bg-white dark:!bg-neutral-800 dark:!text-white border border-gray-100 dark:border-neutral-700 shadow-xl',
  title: '!text-dark dark:!text-white font-bold',
  htmlContainer: '!text-gray-600 dark:!text-gray-300',
};

export const showAlert = MySwal.mixin({
  customClass: baseStyles,
  buttonsStyling: false,
});

// --- ABSTRACCIÓN 1: TOASTS (NOTIFICACIONES) ---
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
    reverseButtons: true, 
    focusCancel: true,    
  });
};

// --- ABSTRACCIÓN 3: INPUTS (URL / TEXTO) --- 🟢 NUEVO
// Úsalo para: Pedir URL de avatar, cambiar nombre rápido, etc.
export const askForInput = async (
  title: string,
  text: string,
  placeholder: string,
  inputType: SweetAlertInput = 'text', // 'text', 'url', 'email', etc.
  confirmText: string = 'Guardar'
) => {
  return showAlert.fire({
    title,
    text,
    input: inputType,
    inputPlaceholder: placeholder,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    
    // 🟢 Sobrescribimos customClass para añadir estilo al input, 
    // pero mantenemos los estilos base usando el objeto baseStyles definido arriba.
    customClass: {
      ...baseStyles, // Heredamos botones y popup
      input: 'w-full p-3 rounded-lg border border-gray-light dark:border-neutral-600 bg-white dark:bg-neutral-900 text-dark dark:text-white focus:ring-2 focus:ring-[#E96B56] focus:border-transparent outline-none transition-all mt-4 shadow-inner placeholder-gray-400'
    }
  });
};