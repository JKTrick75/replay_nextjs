import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// Configuración base
export const showAlert = MySwal.mixin({
  customClass: {
    confirmButton: 'bg-[#E96B56] text-white px-6 py-2 rounded-lg font-bold mx-2 hover:bg-[#ee8b7a] transition-colors shadow-md',
    cancelButton: 'bg-gray-200 text-gray-600 px-6 py-2 rounded-lg font-bold mx-2 hover:bg-gray-300 transition-colors',
    
    // 👇 CAMBIOS CLAVE AQUÍ: Añadido '!' al principio de las clases de color
    // Esto fuerza el color oscuro sobre el blanco por defecto de la librería
    popup: 'rounded-2xl !bg-white dark:!bg-neutral-800 dark:!text-white border border-gray-100 dark:border-neutral-700 shadow-xl',
    title: '!text-dark dark:!text-white font-bold',
    htmlContainer: '!text-gray-600 dark:!text-gray-300',
  },
  buttonsStyling: false,
  // No ponemos background ni color aquí para dejar que el CSS de arriba mande
});

// Helper para confirmaciones
export const confirmAction = async (title: string, text: string, confirmText: string = 'Sí, continuar') => {
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

// Helper para éxitos (Toast)
export const toastSuccess = (title: string) => {
  return showAlert.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: title,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });
};