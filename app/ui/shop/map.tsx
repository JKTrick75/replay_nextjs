'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Listing } from '@/app/lib/definitions';
import Link from 'next/link';

// CONFIGURACIÓN DEL MARCADOR PERSONALIZADO
const customIcon = L.icon({
  iconUrl: '/marker.png',
  iconSize: [40, 40], 
  iconAnchor: [20, 40], 
  popupAnchor: [0, -40],
});

const DEFAULT_CENTER: [number, number] = [40.416775, -3.703790];

export default function ShopMap({ listings }: { listings: Listing[] }) {
  
  let center: [number, number] = DEFAULT_CENTER;
  let zoom = 6;

  if (listings.length === 1 && listings[0].lat && listings[0].lng) {
    center = [listings[0].lat, listings[0].lng];
    zoom = 13; 
  }

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        key={`${center[0]}-${center[1]}`} 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={false} 
        className="h-full w-full"
        style={{ background: '#262626' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="dark:filter dark:invert dark:grayscale dark:contrast-75" 
        />

        {listings.map((ad) => {
          const lat = ad.lat || DEFAULT_CENTER[0];
          const lng = ad.lng || DEFAULT_CENTER[1];

          if (!ad.lat || !ad.lng) return null;

          return (
            <Marker 
              key={ad.id} 
              position={[lat, lng]} 
              icon={customIcon}
            >
              <Popup>
                <Link 
                  href={`/tienda/${ad.id}`}
                  // DISEÑO TIPO "CARTA":
                  // w-32 (más estrecho) y h-35 (alto fijo) para que todas sean iguales
                  className="group block w-32 h-35 relative rounded-lg overflow-hidden shadow-lg border border-white/20 font-sans" 
                >
                  {/* 1. IMAGEN DE FONDO (Ocupa todo el espacio) */}
                  <img 
                    src={ad.game?.coverImage || '/placeholder.png'} 
                    alt={ad.game?.title || 'Juego'}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* 2. DEGRADADO OSCURO (Para que se lea el texto abajo) */}
                  <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent opacity-90" />

                  {/* 3. BADGE DE CONDICIÓN (Arriba Derecha) */}
                  <div className="absolute top-1 left-1 bg-primary text-white text-[9px] px-1.5 py-0.5 rounded font-bold shadow-sm">
                    {ad.condition}
                  </div>

                  {/* 4. INFORMACIÓN (Pegada abajo, sobre la foto) */}
                  <div className="absolute bottom-0 w-full p-2 flex flex-col justify-end">
                    
                    {/* Título en blanco */}
                    <h3 className="font-bold text-white text-[11px] leading-tight mb-1 drop-shadow-md line-clamp-2">
                      {ad.game?.title}
                    </h3>
                    
                    <div className="flex justify-between items-center">
                        {/* Plataforma (Badge oscuro semi-transparente) */}
                        <span className="text-[9px] font-bold text-white bg-white/20 backdrop-blur-md px-1.5 py-0.5 rounded uppercase">
                            {ad.platform?.shortName || ad.platform?.name?.substring(0, 3)}
                        </span>
                        
                        {/* Precio en tu color primary */}
                        <span className="text-sm font-black text-primary drop-shadow-md">
                            {ad.price} €
                        </span>
                    </div>
                  </div>
                </Link>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}