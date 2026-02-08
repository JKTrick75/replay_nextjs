import Link from 'next/link';
import { 
  Gamepad2, Monitor, Swords, Trophy, Ghost, Rocket, 
  Cpu, Car, Music, Joystick, Zap, Brain, 
  Puzzle, LayoutGrid, Box 
} from 'lucide-react';

export default function CategoryGrid() {
  
  // Consolas: Ajustamos la posición (bgIconPosition) individualmente
  const consoles = [
    { 
      name: 'PlayStation', 
      href: '/tienda?platform=PS', 
      hoverColor: 'hover:border-blue-500 hover:shadow-blue-500/20 dark:hover:shadow-blue-900/30 text-blue-600 dark:text-blue-400',
      bgIconClass: 'text-blue-500/5', 
      icon: <Gamepad2 size={32} />,
      BgIcon: Gamepad2,
      bgIconPosition: '-right-4 -bottom-4'
    },
    { 
      name: 'Nintendo', 
      href: '/tienda?platform=Switch', 
      hoverColor: 'hover:border-red-500 hover:shadow-red-500/20 dark:hover:shadow-red-900/30 text-red-600 dark:text-red-400',
      bgIconClass: 'text-red-500/5',
      icon: <Joystick size={32} />,
      BgIcon: Joystick,
      // 👇 SUBIMOS EL JOYSTICK: -bottom-2 en lugar de -4 para que se vea la base
      bgIconPosition: '-right-4 -bottom-2' 
    },
    { 
      name: 'Xbox', 
      href: '/tienda?platform=Xbox', 
      hoverColor: 'hover:border-green-500 hover:shadow-green-500/20 dark:hover:shadow-green-900/30 text-green-600 dark:text-green-400',
      bgIconClass: 'text-green-500/5',
      icon: <Gamepad2 size={32} />,
      BgIcon: Gamepad2,
      // 👇 Posición estándar
      bgIconPosition: '-right-4 -bottom-4'
    },
    { 
      name: 'PC / Retro', 
      href: '/tienda?platform=PC',
      hoverColor: 'hover:border-purple-500 hover:shadow-purple-500/20 dark:hover:shadow-purple-900/30 text-purple-600 dark:text-purple-400',
      bgIconClass: 'text-purple-500/5',
      icon: <Monitor size={32} />,
      BgIcon: Monitor,
      // 👇 SUBIMOS EL MONITOR: -bottom-2 para que no se corte el soporte
      bgIconPosition: '-right-4 -bottom-2'
    },
  ];

  // LISTA DE GÉNEROS
  const genres = [
    { name: 'Acción', icon: CrosshairIcon, href: '/tienda?genre=Acción', color: 'text-red-500' },
    { name: 'Aventura', icon: Rocket, href: '/tienda?genre=Aventura', color: 'text-cyan-500' },
    { name: 'RPG', icon: Swords, href: '/tienda?genre=RPG', color: 'text-orange-500' },
    { name: 'Shooter', icon: CrosshairIcon, href: '/tienda?genre=Shooter', color: 'text-rose-500' },
    { name: 'Deportes', icon: Trophy, href: '/tienda?genre=Deportes', color: 'text-yellow-500' },
    { name: 'Carreras', icon: Car, href: '/tienda?genre=Carreras', color: 'text-blue-500' },
    { name: 'Lucha', icon: Zap, href: '/tienda?genre=Lucha', color: 'text-amber-600' },
    { name: 'Estrategia', icon: Brain, href: '/tienda?genre=Estrategia', color: 'text-indigo-500' },
    { name: 'Plataformas', icon: Layers, href: '/tienda?genre=Plataformas', color: 'text-purple-500' },
    { name: 'Terror', icon: Ghost, href: '/tienda?genre=Terror', color: 'text-gray-500' },
    { name: 'Simulación', icon: Box, href: '/tienda?genre=Simulación', color: 'text-emerald-500' },
    { name: 'Puzzle', icon: Puzzle, href: '/tienda?genre=Puzzle', color: 'text-pink-500' },
    { name: 'Musical', icon: Music, href: '/tienda?genre=Musical', color: 'text-fuchsia-500' },
    { name: 'Varios', icon: LayoutGrid, href: '/tienda?genre=Varios', color: 'text-slate-500' },
  ];

  return (
    <section className="py-16 bg-white dark:bg-neutral-900 border-y border-gray-light dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. SECCIÓN CONSOLAS */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-dark dark:text-white mb-8 flex items-center gap-2">
            <span className="w-1.5 h-8 bg-primary rounded-full mr-2"></span>
            Elige tu Plataforma
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {consoles.map((console) => {
              const BgIcon = console.BgIcon;
              return (
                <Link 
                  key={console.name} 
                  href={console.href}
                  className={`
                    group relative h-40 rounded-2xl border-2 border-transparent 
                    bg-gray-50 hover:bg-white 
                    dark:bg-neutral-800 dark:hover:bg-neutral-800 
                    transition-all duration-300 ease-out hover:-translate-y-1 overflow-hidden
                    ${console.hoverColor}
                  `}
                >
                  {/* Icono gigante de fondo (Posición dinámica con bgIconPosition) */}
                  <div className={`absolute opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${console.bgIconClass} ${console.bgIconPosition}`}>
                     <BgIcon size={120} strokeWidth={1} />
                  </div>
  
                  <div className="relative z-10 h-full flex flex-col items-center justify-center gap-3">
                    <div className="p-3 bg-white dark:bg-neutral-700 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
                      {console.icon}
                    </div>
                    <span className="font-bold text-lg text-dark dark:text-white group-hover:text-primary transition-colors">
                      {console.name}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 2. SECCIÓN GÉNEROS (CARRUSEL) */}
        <div>
          <h2 className="text-xl font-bold text-dark dark:text-white mb-6 flex items-center justify-between">
            <span>Explora por Género</span>
            <Link href="/tienda" className="text-sm text-primary font-medium hover:underline hidden sm:block">Ver todos los juegos</Link>
          </h2>
          
          <div className="relative w-full">
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-linear-to-r from-white dark:from-neutral-900 to-transparent z-10 pointer-events-none sm:hidden" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-linear-to-l from-white dark:from-neutral-900 to-transparent z-10 pointer-events-none sm:hidden" />

            <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 dark:scrollbar-thumb-neutral-700 snap-x">
              {genres.map((genre) => {
                const Icon = genre.icon;
                return (
                  <Link
                    key={genre.name}
                    href={genre.href}
                    className="
                      snap-start
                      min-w-27.5 w-27.5 sm:min-w-32.5 sm:w-32.5
                      flex flex-col items-center justify-center gap-3 
                      p-4 rounded-xl 
                      bg-gray-50 dark:bg-neutral-800/50 
                      hover:bg-white dark:hover:bg-neutral-800 
                      border border-transparent hover:border-gray-200 dark:hover:border-neutral-700 
                      hover:shadow-md transition-all duration-200 group text-center
                    "
                  >
                    <div className={`p-2.5 rounded-xl bg-white dark:bg-neutral-700 group-hover:bg-primary/10 transition-colors ${genre.color} group-hover:text-primary shadow-sm`}>
                      <Icon size={24} />
                    </div>
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300 group-hover:text-dark dark:group-hover:text-white truncate w-full">
                      {genre.name}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

// Helpers
function Layers({ size, className }: { size?: number, className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
}

function CrosshairIcon({ size, className }: { size?: number, className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/></svg>
}