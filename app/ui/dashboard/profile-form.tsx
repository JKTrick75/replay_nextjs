'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation'; 
import { updateProfile } from '@/app/lib/actions';
import { User as UserType } from '@/app/lib/definitions';
import { Pencil, Save, RefreshCw, MapPin, Mail, Lock, User as UserIcon, CheckCircle2, Link as LinkIcon, Loader2, Check, X } from 'lucide-react';

export default function ProfileForm({ user }: { user: UserType }) {
  const router = useRouter(); 

  // Estado para feedback visual
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<any>({});
  const [isPending, setIsPending] = useState(false);

  // Estados para controlar qué campos son editables
  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({});

  // Estado para la imagen
  const [avatarUrl, setAvatarUrl] = useState(user.image || `https://api.dicebear.com/9.x/pixel-art/svg?seed=${user.name}`);

  // --- ESTADOS PARA VALIDACIÓN EN TIEMPO REAL ---
  const [emailInput, setEmailInput] = useState(user.email);
  const [confirmEmailInput, setConfirmEmailInput] = useState('');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Lógica de coincidencia
  const emailsMatch = confirmEmailInput.length > 0 && emailInput === confirmEmailInput;
  const emailsMismatch = confirmEmailInput.length > 0 && emailInput !== confirmEmailInput;

  const passwordsMatch = newPassword.length > 0 && newPassword === confirmNewPassword;
  const passwordsMismatch = confirmNewPassword.length > 0 && newPassword !== confirmNewPassword;

  // --- LÓGICA DE CIUDAD ---
  const [cityQuery, setCityQuery] = useState(user.city || '');
  const [cityResults, setCityResults] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState<{ name: string, lat: string, lng: string } | null>({
    name: user.city || '',
    lat: user.lat?.toString() || '',
    lng: user.lng?.toString() || ''
  });
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const cityWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editMode.city) return;
    const timer = setTimeout(async () => {
      if (cityQuery.length > 2) {
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
  }, [cityQuery, editMode.city]);

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
    setSelectedCity({ name: cityName, lat: result.lat, lng: result.lon });
    setCityQuery(cityName);
    setShowCityDropdown(false);
  };

  const toggleEdit = (field: string) => {
    setEditMode((prev) => ({ ...prev, [field]: !prev[field] }));
    if (editMode[field]) { 
       if (field === 'email') setConfirmEmailInput('');
       if (field === 'password') { setNewPassword(''); setConfirmNewPassword(''); }
    }
  };

  const handleRegenerateAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    const newUrl = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${randomSeed}`;
    setAvatarUrl(newUrl);
  };

  const handleUrlAvatar = () => {
    const url = window.prompt("Introduce la URL de tu imagen:");
    if (url && url.trim() !== "") {
      setAvatarUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setMessage(null);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    formData.append('image', avatarUrl);
    
    if (selectedCity?.lat) formData.append('lat', selectedCity.lat);
    if (selectedCity?.lng) formData.append('lng', selectedCity.lng);
    if (selectedCity?.name) formData.set('city', selectedCity.name);

    if (!editMode.email) {
      formData.delete('email');
      formData.delete('confirmEmail');
    }
    if (!editMode.password) {
      formData.delete('currentPassword');
      formData.delete('newPassword');
      formData.delete('confirmNewPassword');
    }

    const result = await updateProfile({ message: null, errors: {} }, formData);

    setIsPending(false);
    if (result?.errors) {
      setErrors(result.errors);
    } else if (result?.message) {
      setMessage(result.message);
      if (result.message.includes('éxito')) {
        setEditMode({});
        router.refresh(); 
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 md:p-10">
      
      {/* MENSAJE DE ÉXITO/ERROR GLOBAL */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${message.includes('éxito') ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700'}`}>
          <CheckCircle2 size={20} />
          {message}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-10">
        
        {/* --- COLUMNA IZQUIERDA: AVATAR --- */}
        <div className="flex flex-col items-center gap-4 min-w-50">
          <div className="relative group">
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white dark:border-neutral-800 shadow-xl bg-gray-100">
              <img 
                src={avatarUrl} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            
            <button
              type="button"
              onClick={handleRegenerateAvatar}
              className="absolute bottom-2 right-2 bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary-hover transition-transform hover:scale-110 z-10"
              title="Generar nuevo avatar aleatorio"
            >
              <RefreshCw size={18} />
            </button>

            <button
              type="button"
              onClick={handleUrlAvatar}
              className="absolute top-2 right-2 bg-dark dark:bg-white text-white dark:text-dark p-2 rounded-full shadow-lg hover:opacity-90 transition-transform hover:scale-110 z-10"
              title="Usar URL de imagen"
            >
              <LinkIcon size={16} />
            </button>
          </div>
          <p className="text-sm text-gray-500 text-center max-w-50">
            Personaliza tu avatar o usa una imagen de internet.
          </p>
        </div>

        {/* --- COLUMNA DERECHA: CAMPOS --- */}
        <div className="flex-1 space-y-6">
          
          {/* 1. NOMBRE */}
          <div className="relative">
            <label className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-2">
              <UserIcon size={16} /> Nombre
            </label>
            <div className="flex items-center gap-2">
              <input
                name="name"
                defaultValue={user.name}
                readOnly={!editMode.name} 
                className={`w-full p-3 rounded-lg border transition-all
                  ${editMode.name 
                    ? 'border-primary ring-1 ring-primary bg-white dark:bg-neutral-900 text-dark dark:text-white' 
                    : 'border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/50 text-gray-500 cursor-not-allowed focus:outline-none'}
                `}
              />
              <button 
                type="button" 
                onClick={() => toggleEdit('name')}
                className="p-2 text-gray-400 hover:text-primary transition-colors"
              >
                <Pencil size={20} />
              </button>
            </div>
            {/* 👇 ERROR DE NOMBRE MEJORADO */}
            {errors.name && (
              <div className="mt-1 text-xs text-primary flex flex-col gap-0.5 animate-in fade-in">
                 {errors.name.map((err: string) => <span key={err}>• {err}</span>)}
              </div>
            )}
          </div>

          {/* 2. UBICACIÓN */}
          <div className="relative" ref={cityWrapperRef}>
            <label className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-2">
              <MapPin size={16} /> Ciudad
            </label>
            
            <div className="flex items-center gap-2 relative">
              <div className="relative w-full">
                <input
                  value={cityQuery}
                  onChange={(e) => {
                    setCityQuery(e.target.value);
                    if (editMode.city) setShowCityDropdown(true);
                  }}
                  readOnly={!editMode.city}
                  placeholder="Ej: Valencia"
                  className={`w-full p-3 rounded-lg border transition-all
                    ${editMode.city 
                      ? 'border-primary ring-1 ring-primary bg-white dark:bg-neutral-900 text-dark dark:text-white' 
                      : 'border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/50 text-gray-500 cursor-not-allowed focus:outline-none'}
                  `}
                />
                {isSearchingCity && (
                   <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="animate-spin text-gray-400" size={18} />
                   </div>
                )}
              </div>

              <button 
                type="button" 
                onClick={() => toggleEdit('city')}
                className="p-2 text-gray-400 hover:text-primary transition-colors"
              >
                <Pencil size={20} />
              </button>
            </div>

            {showCityDropdown && cityResults.length > 0 && editMode.city && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 shadow-xl overflow-hidden max-h-48 overflow-y-auto left-0">
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
            <p className="text-xs text-gray-400 mt-1">Cambiar la ciudad solo afectará a los anuncios que crees a partir de ahora.</p>
          </div>

          <div className="border-t border-gray-light dark:border-neutral-700 my-6"></div>

          {/* 3. EMAIL (Con validación visual) */}
          <div className="space-y-3 p-4 rounded-xl bg-gray-50 dark:bg-neutral-800/50 border border-gray-100 dark:border-neutral-800">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Mail size={16} /> Correo Electrónico
              </label>
              <button 
                type="button" 
                onClick={() => toggleEdit('email')}
                className="p-2 text-gray-400 hover:text-primary transition-colors"
                title="Editar Email"
              >
                <Pencil size={18} />
              </button>
            </div>

            <input
              name="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)} 
              readOnly={!editMode.email} 
              className={`w-full p-3 rounded-lg border transition-all
                ${editMode.email 
                  ? 'border-primary bg-white dark:bg-neutral-900 text-dark dark:text-white' 
                  : 'border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-500 cursor-not-allowed focus:outline-none opacity-70'}
              `}
            />
            {/* 👇 ERROR DE EMAIL MEJORADO */}
            {errors.email && (
              <div className="mt-1 text-xs text-primary flex flex-col gap-0.5 animate-in fade-in">
                 {errors.email.map((err: string) => <span key={err}>• {err}</span>)}
              </div>
            )}

            {editMode.email && (
              <div className="animate-in fade-in slide-in-from-top-2 space-y-2">
                <input
                  name="confirmEmail"
                  value={confirmEmailInput}
                  onChange={(e) => setConfirmEmailInput(e.target.value)}
                  placeholder="Confirma el nuevo correo"
                  className="w-full p-3 rounded-lg border border-primary bg-white dark:bg-neutral-900"
                />
                
                {/* FEEDBACK VISUAL EMAIL */}
                <div className="min-h-5 text-sm font-medium transition-all duration-300">
                  {emailsMismatch && (
                    <div className="flex items-center gap-2 text-primary animate-pulse"> {/* Usamos text-primary (rojo de marca) */}
                      <X size={16} />
                      <span>Los correos no coinciden.</span>
                    </div>
                  )}
                  {emailsMatch && (
                    <div className="flex items-center gap-2 text-green-600 animate-bounce-short">
                      <Check size={16} />
                      <span>¡Los correos coinciden!</span>
                    </div>
                  )}
                </div>
                {errors.confirmEmail && <p className="text-primary text-xs mt-1">{errors.confirmEmail[0]}</p>}
              </div>
            )}
          </div>

          {/* 4. PASSWORD (Con validación visual COMPLETA) */}
          <div className="space-y-3 p-4 rounded-xl bg-gray-50 dark:bg-neutral-800/50 border border-gray-100 dark:border-neutral-800">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Lock size={16} /> Contraseña
              </label>
              <button 
                type="button" 
                onClick={() => toggleEdit('password')}
                className="p-2 text-gray-400 hover:text-primary transition-colors"
                title="Cambiar Contraseña"
              >
                <Pencil size={18} />
              </button>
            </div>

            <input
              type="password"
              value="********"
              readOnly
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800 text-gray-400 cursor-not-allowed focus:outline-none"
            />

            {editMode.password && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 mt-2">
                <div>
                  <label className="text-xs text-gray-500">Contraseña Actual (Seguridad)</label>
                  <input
                    name="currentPassword"
                    type="password"
                    placeholder="Tu contraseña actual"
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-900"
                  />
                  {errors.currentPassword && <p className="text-primary text-xs mt-1">{errors.currentPassword[0]}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <input
                      name="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nueva contraseña"
                      className="w-full p-3 rounded-lg border border-primary bg-white dark:bg-neutral-900"
                    />
                    {/* 👇 AQUÍ ESTÁ: ERRORES DE CONTRASEÑA EN ROJO (CORAL) */}
                    {errors.newPassword && (
                      <div className="mt-1 text-xs text-primary flex flex-col gap-0.5 animate-in fade-in">
                        {errors.newPassword.map((err: string) => <span key={err}>• {err}</span>)}
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      name="confirmNewPassword"
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Repetir nueva"
                      className="w-full p-3 rounded-lg border border-primary bg-white dark:bg-neutral-900"
                    />
                  </div>
                </div>

                {/* FEEDBACK VISUAL COINCIDENCIA */}
                <div className="min-h-5 text-sm font-medium transition-all duration-300">
                  {passwordsMismatch && (
                    <div className="flex items-center gap-2 text-primary animate-pulse">
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
                </div>
                
                {errors.confirmNewPassword && <p className="text-primary text-xs">{errors.confirmNewPassword[0]}</p>}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* BOTÓN DE GUARDAR GLOBAL */}
      <div className="mt-10 flex justify-end">
        <button
          type="submit"
          disabled={isPending || emailsMismatch || passwordsMismatch} // Bloqueamos si hay errores
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Guardando...' : (
            <>
              <Save size={20} /> Guardar Cambios
            </>
          )}
        </button>
      </div>

    </form>
  );
}