import Link from 'next/link';

export default function Hero() {
  return (
    <div className="relative bg-dark text-white overflow-hidden mb-8">
      {/* Fondo con imagen y superposición oscura */}
      <div className="absolute inset-0">
        {/* Imagen de fondo (puedes cambiar la URL por la que quieras más adelante) */}
        <img 
          src="https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=2070&auto=format&fit=crop" 
          alt="Fondo Videojuegos" 
          className="w-full h-full object-cover opacity-30"
        />
        {/* Degradado para que el texto se lea mejor */}
        <div className="absolute inset-0 bg-linear-to-t from-dark via-transparent to-transparent"></div>
      </div>

      {/* Contenido (Texto y Botones) */}
      <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">
          Bienvenido a <span className="text-primary">Replay</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mb-8">
          Tu tienda de juegos y consolas de segunda mano.
          <span className="block text-lg mt-2 font-light text-gray-400">
            Encuentra clásicos y novedades al mejor precio.
          </span>
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/tienda" 
            className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg"
          >
            Ver Catálogo
          </Link>
          <Link 
            href="/registro" 
            className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-dark font-bold py-3 px-8 rounded-full transition-all"
          >
            Empezar a Vender
          </Link>
        </div>
      </div>
    </div>
  );
}