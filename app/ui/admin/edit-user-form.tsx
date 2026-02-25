'use client';

import { useActionState, useState, useEffect, useRef } from 'react';
import { updateUserByAdmin } from '@/app/lib/actions';
import { State, User } from '@/app/lib/definitions';
import { User as UserIcon, Mail, MapPin, Shield, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { showToast } from '@/app/lib/swal';
import { useRouter } from 'next/navigation';

export default function EditUserForm({ userToEdit }: { userToEdit: User }) {
  const initialState: State = { message: null, errors: {} };
  const [state, formAction] = useActionState(updateUserByAdmin, initialState);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  // --- LÓGICA DE CIUDAD ---
  const [cityQuery, setCityQuery] = useState(userToEdit.city || '');
  const [cityResults, setCityResults] = useState<any[]>([]);
  //Inicializamos con los datos del usuario si existen
  const [selectedCity, setSelectedCity] = useState<{ name: string, lat: string | number, lng: string | number } | null>(
    userToEdit.city 
      ? { name: userToEdit.city, lat: userToEdit.lat || 0, lng: userToEdit.lng || 0 } 
      : null
  );
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const cityWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsPending(false);
    if (state.success) {
      showToast('success', 'Usuario Actualizado', 'Los cambios se han guardado correctamente.');
      router.push('/admin/usuarios');
      router.refresh();
    } else if (state.message) {
      showToast('error', 'Error', state.message);
    }
  }, [state, router]);

  //Efecto para buscar ciudad al escribir
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (cityQuery.length > 2 && (!selectedCity || cityQuery !== selectedCity.name)) {
        setIsSearchingCity(true);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${cityQuery}&countrycodes=es&limit=5`);
          const data = await res.json();
          setCityResults(data);
          setShowCityDropdown(true);
        } catch (err) {
          console.error("Error buscando ciudad", err);
        } finally {
          setIsSearchingCity(false);
        }
      } else {
        setCityResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [cityQuery, selectedCity]);

  //Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cityWrapperRef.current && !cityWrapperRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [cityWrapperRef]);

  const handleSelectCity = (result: any) => {
    const cityName = result.display_name.split(',')[0]; 
    setSelectedCity({
      name: cityName,
      lat: result.lat,
      lng: result.lon
    });
    setCityQuery(cityName);
    setShowCityDropdown(false);
  };

  return (
    <form action={formAction} onSubmit={() => setIsPending(true)} className="bg-white dark:bg-neutral-800 shadow-sm rounded-xl border border-gray-200 dark:border-neutral-700 overflow-hidden">
      
      <input type="hidden" name="userId" value={userToEdit.id} />

      <div className="p-6 md:p-8 space-y-6">
        {/* Cabecera visual */}
        <div className="flex items-center gap-4 mb-6">
            <img 
              src={userToEdit.image || `https://ui-avatars.com/api/?name=${userToEdit.name}`} 
              alt="Avatar" 
              className="w-16 h-16 rounded-full border-2 border-gray-200 dark:border-neutral-600"
            />
            <div>
                <h2 className="text-xl font-bold text-dark dark:text-white">{userToEdit.name}</h2>
                <p className="text-sm text-gray-500">ID: {userToEdit.id}</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* NOMBRE */}
            <div>
                <label className="mb-2 block text-sm font-bold text-dark dark:text-gray-200">Nombre</label>
                <div className="relative">
                    <input name="name" defaultValue={userToEdit.name} type="text" className="peer block w-full rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 py-3 pl-10 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-dark dark:text-white" />
                    <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            {/* EMAIL */}
            <div>
                <label className="mb-2 block text-sm font-bold text-dark dark:text-gray-200">Email</label>
                <div className="relative">
                    <input name="email" defaultValue={userToEdit.email} type="email" className="peer block w-full rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 py-3 pl-10 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-dark dark:text-white" />
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            {/* CIUDAD */}
            <div className="relative" ref={cityWrapperRef}>
                <label className="mb-2 block text-sm font-bold text-dark dark:text-gray-200">Ciudad</label>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Busca ciudad..."
                        value={cityQuery}
                        onChange={(e) => {
                            setCityQuery(e.target.value);
                            if (selectedCity && e.target.value !== selectedCity.name) {
                                setSelectedCity(null); 
                            }
                        }}
                        className="peer block w-full rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 py-3 pl-10 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-dark dark:text-white"
                    />
                    {isSearchingCity ? (
                       <Loader2 className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 animate-spin" />
                    ) : (
                       <MapPin className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    )}
                </div>

                {/* Campos ocultos para enviar al servidor */}
                <input type="hidden" name="city" value={selectedCity?.name || ''} />
                <input type="hidden" name="lat" value={selectedCity?.lat || ''} />
                <input type="hidden" name="lng" value={selectedCity?.lng || ''} />

                {/* Dropdown de resultados */}
                {showCityDropdown && cityResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                        {cityResults.map((result: any) => (
                            <div
                                key={result.place_id}
                                onClick={() => handleSelectCity(result)}
                                className="cursor-pointer px-4 py-3 hover:bg-primary/10 text-sm text-dark dark:text-white border-b border-gray-100 dark:border-neutral-800 last:border-0 transition-colors"
                            >
                                {result.display_name}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ROL (Solo visible para admins) */}
            <div>
                <label className="mb-2 block text-sm font-bold text-dark dark:text-gray-200">Rol de Usuario</label>
                <div className="relative">
                    <select name="role" defaultValue={userToEdit.role} className="peer block w-full rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 py-3 pl-10 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-dark dark:text-white appearance-none cursor-pointer">
                        <option value="user">Usuario Normal</option>
                        <option value="admin">Administrador</option>
                    </select>
                    <Shield className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                </div>
                <p className="mt-1 text-xs text-primary font-medium">
                   Cuidado: Dar permisos de admin permite acceso total.
                </p>
            </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-neutral-900/50 p-6 flex justify-end gap-4 border-t border-gray-200 dark:border-neutral-700">
        <Link href="/admin/usuarios" className="px-6 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors">
            Cancelar
        </Link>
        <button type="submit" disabled={isPending} className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-primary-hover shadow-md transition-all disabled:opacity-50">
            <Save size={18} /> {isPending ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
}