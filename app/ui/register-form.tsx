'use client';

import { useActionState, useState, useEffect, useRef } from 'react';
import { register } from '@/app/lib/actions';
import { State } from '@/app/lib/definitions';
import { User, Mail, Lock, MapPin, Loader2, AlertCircle, UserPlus, Check, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { showToast } from '@/app/lib/swal';

export default function RegisterForm() {
  const initialState: State = { message: null, errors: {} };
  const [state, formAction] = useActionState(register, initialState);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsPending(false);

    if (state.success) {
      showToast('success', '¡Bienvenido!', 'Tu cuenta ha sido creada. Ahora inicia sesión.');
      router.push('/login');
    } else if (state.message) {
      showToast('error', 'Error', state.message);
    }
  }, [state, router]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const passwordsMatch = password === confirmPassword && password.length > 0;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  // --- LÓGICA DE CIUDAD ---
  const [cityQuery, setCityQuery] = useState('');
  const [cityResults, setCityResults] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState<{ name: string, lat: string, lng: string } | null>(null);
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const cityWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (cityQuery.length > 2 && !selectedCity) {
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

  const inputClasses = `
    peer block w-full rounded-lg px-4 py-3 pl-11 text-base outline-none transition-all duration-200
    border border-gray-300 dark:border-neutral-600 
    bg-white dark:bg-neutral-900
    text-dark dark:text-white 
    placeholder:text-gray-400
    focus:border-primary focus:border-2 focus:ring-0
    [&:not(:placeholder-shown)]:border-primary 
    [&:not(:placeholder-shown)]:border-2
  `;

  return (
    <form 
      action={formAction} 
      onSubmit={() => setIsPending(true)} 
      className="bg-white dark:bg-neutral-800 shadow-xl rounded-2xl border border-gray-200 dark:border-neutral-700 overflow-hidden transition-colors duration-300"
    >
      <div className="px-8 pt-8 pb-4">
        <h1 className="text-3xl font-bold text-dark dark:text-white mb-2">
          Crea tu cuenta
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Únete a la comunidad y empieza a comprar y vender juegos.
        </p>
      </div>

      <div className="px-8 pb-8 space-y-5">
        
        {/* 1- NOMBRE */}
        <div>
          <label className="mb-2 block text-sm font-bold text-dark dark:text-gray-200">
            Nombre completo
          </label>
          <div className="relative group">
            <input name="name" type="text" placeholder="Tu nombre" className={inputClasses} />
            <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 peer-focus:text-primary peer-[:not(:placeholder-shown)]:text-primary transition-colors" />
          </div>
          {state.errors?.name && <p className="mt-1 text-xs text-primary font-medium">{state.errors.name[0]}</p>}
        </div>

        {/* 2- EMAIL */}
        <div>
          <label className="mb-2 block text-sm font-bold text-dark dark:text-gray-200">
            Correo electrónico
          </label>
          <div className="relative group">
            <input name="email" type="email" placeholder="ejemplo@correo.com" className={inputClasses} />
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 peer-focus:text-primary peer-[:not(:placeholder-shown)]:text-primary transition-colors" />
          </div>
          {state.errors?.email && <p className="mt-1 text-xs text-primary font-medium">{state.errors.email[0]}</p>}
        </div>

        {/* 3- CIUDAD */}
        <div className="relative" ref={cityWrapperRef}>
          <label className="mb-2 block text-sm font-bold text-dark dark:text-gray-200">
            Ciudad de Residencia
          </label>
          <div className="relative group">
            <input
              type="text"
              placeholder="Busca tu pueblo o ciudad..."
              value={cityQuery}
              onChange={(e) => {
                setCityQuery(e.target.value);
                setSelectedCity(null);
              }}
              className={inputClasses}
            />
            {isSearchingCity ? (
               <Loader2 className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 animate-spin" />
            ) : (
               <MapPin className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 peer-focus:text-primary peer-[:not(:placeholder-shown)]:text-primary transition-colors" />
            )}
          </div>

          <input type="hidden" name="city" value={selectedCity?.name || ''} />
          <input type="hidden" name="lat" value={selectedCity?.lat || ''} />
          <input type="hidden" name="lng" value={selectedCity?.lng || ''} />

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
          {state.errors?.city && <p className="mt-1 text-xs text-primary font-medium">{state.errors.city[0]}</p>}
        </div>

        {/* 4- CONTRASEÑAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="mb-2 block text-sm font-bold text-dark dark:text-gray-200">
              Contraseña
            </label>
            <div className="relative group">
              <input name="password" type="password" placeholder="******" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClasses} />
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 peer-focus:text-primary peer-[:not(:placeholder-shown)]:text-primary transition-colors" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-dark dark:text-gray-200">
              Repetir Contraseña
            </label>
            <div className="relative group">
              <input name="confirmPassword" type="password" placeholder="******" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClasses} />
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 peer-focus:text-primary peer-[:not(:placeholder-shown)]:text-primary transition-colors" />
            </div>
          </div>
        </div>

        {/* 5- FEEDBACK VISUAL */}
        <div className="min-h-5 text-sm font-medium transition-all duration-300">
          {passwordsMismatch && (
            <div className="flex items-center gap-2 text-red-500 animate-pulse">
              <X size={16} />
              <span>Las contraseñas no coinciden.</span>
            </div>
          )}
          {passwordsMatch && (
            <div className="flex items-center gap-2 text-green-600 animate-bounce-short">
              <Check size={16} />
              <span>¡Las contraseñas coinciden!</span>
            </div>
          )}
          {state.errors?.password && !passwordsMismatch && (
             <div className="mt-1 text-xs text-primary flex flex-col gap-0.5">
                {state.errors.password.map((err) => <span key={err}>• {err}</span>)}
             </div>
          )}
        </div>

        {/* 6- MENSAJE GENERAL ERROR */}
        {state.message && (
             <div className="flex items-center gap-2 text-primary bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-primary/20">
               <AlertCircle className="h-5 w-5 shrink-0" />
               <p className="text-sm font-medium">{state.message}</p>
             </div>
        )}

        <button
          type="submit"
          disabled={isPending || passwordsMismatch}
          className="w-full bg-primary text-white text-lg font-bold py-3 px-4 rounded-xl hover:bg-primary-hover transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Creando cuenta...' : 'Crear Cuenta'}
          {!isPending && <UserPlus size={20} />}
        </button>

        <div className="pt-2 text-center">
          <p className="text-sm text-gray-500">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-primary font-bold hover:underline transition-colors">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </form>
  );
}