import Link from 'next/link';
// Asegúrate de que tienes los iconos que usas importados
import { Gamepad2, Monitor, Swords, Trophy, Ghost, Rocket, Globe, Earth } from 'lucide-react';

export default function CategoryGrid() {
  
  const consoles = [
    { 
      name: 'PlayStation', 
      href: '/tienda?platform=PS', // Ajusta según tu BBDD (ej: 'PS5')
      color: 'from-blue-600 to-blue-400',
      icon: <Gamepad2 className="w-10 h-10 text-white" />
    },
    { 
      name: 'Nintendo', 
      href: '/tienda?platform=Switch', // Ajusta según tu BBDD
      color: 'from-red-600 to-red-400',
      icon: <Gamepad2 className="w-10 h-10 text-white" />
    },
    { 
      name: 'Xbox', 
      href: '/tienda?platform=Xbox', // Ajusta según tu BBDD
      color: 'from-green-600 to-green-400',
      icon: <Gamepad2 className="w-10 h-10 text-white" />
    },
    { 
      name: 'PC / Retro', 
      href: '/tienda?platform=PC',
      color: 'from-gray-700 to-gray-500',
      icon: <Monitor className="w-10 h-10 text-white" />
    },
  ];

  const genres = [
    { name: 'RPG', icon: Swords, href: '/tienda?genre=RPG' },
    { name: 'Acción', icon: Swords, href: '/tienda?genre=Acción' },
    { name: 'Deportes', icon: Trophy, href: '/tienda?genre=Deporte' },
    { name: 'Terror', icon: Ghost, href: '/tienda?genre=Terror' },
    { name: 'Aventura', icon: Rocket, href: '/tienda?genre=Aventura' },
    { name: 'Mundo abierto', icon: Globe, href: '/tienda?genre=Mundo Abierto' }, 
  ];

  return (
    // CAMBIO 1: Fondo de sección dark:bg-neutral-950 (igual que el body) y bordes neutrales
    <section className="py-12 bg-white dark:bg-neutral-900 border-y border-gray-light dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h2 className="text-2xl font-bold text-dark dark:text-white mb-8 flex items-center gap-2">
          Explora por Categoría
        </h2>

        {/* GRID DE CONSOLAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {consoles.map((console) => (
            <Link 
              key={console.name} 
              href={console.href}
              className={`relative h-32 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:scale-105 group`}
            >
              <div className={`absolute inset-0 bg-linear-to-br ${console.color} opacity-90 group-hover:opacity-100 transition-opacity`} />
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:w-32 group-hover:h-32 transition-all" />
              <div className="relative z-10 h-full flex flex-col items-center justify-center p-4">
                <div className="mb-2 p-2 bg-white/20 rounded-full backdrop-blur-sm">
                  {console.icon}
                </div>
                <span className="text-white font-bold text-lg tracking-wide">{console.name}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* LISTA DE GÉNEROS */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
            Géneros populares:
          </span>
          <div className="flex flex-wrap gap-3">
            {genres.map((genre) => (
              <Link
                key={genre.name}
                href={genre.href}
                // CAMBIO 2: Píldoras con dark:bg-neutral-800 y dark:text-neutral-300
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-colors text-sm font-medium border border-transparent hover:border-primary"
              >
                <genre.icon size={16} />
                {genre.name}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}