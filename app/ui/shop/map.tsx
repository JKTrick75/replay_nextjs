'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Listing } from '@/app/lib/definitions';
import Link from 'next/link';

// Iconos Fix para Next.js
const iconDefault = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const DEFAULT_CENTER: [number, number] = [40.416775, -3.703790];

export default function ShopMap({ listings }: { listings: Listing[] }) {
  
  let center: [number, number] = DEFAULT_CENTER;
  let zoom = 6;

  // 🔴 CAMBIO 1: Verificamos lat/lng directos, no location object
  // Si solo hay un anuncio y tiene coordenadas válidas
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
          // 🔴 CAMBIO 2: Acceso directo a lat/lng (si son null, usa default)
          const lat = ad.lat || DEFAULT_CENTER[0];
          const lng = ad.lng || DEFAULT_CENTER[1];

          // Si por alguna razón no hay coordenadas, no renderizamos marcador
          if (!ad.lat || !ad.lng) return null;

          return (
            <Marker 
              // 🔴 CAMBIO 3: Usamos ad.id
              key={ad.id} 
              position={[lat, lng]} 
              icon={iconDefault}
            >
              <Popup className="custom-popup">
                <div className="flex flex-col gap-2 min-w-37.5">
                  <div className="h-24 w-full bg-gray-200 rounded-md overflow-hidden relative">
                    <img 
                      // 🔴 CAMBIO 4: Acceso seguro a game
                      src={ad.game?.coverImage || '/placeholder.png'} 
                      alt={ad.game?.title || 'Juego'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div>
                    {/* 🔴 CAMBIO 5: Acceso seguro a game */}
                    <p className="font-bold text-sm truncate text-gray-900">{ad.game?.title}</p>
                    <div className="flex justify-between items-center mt-1">
                        <span className="text-xs font-semibold bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                            {ad.condition}
                        </span>
                        <p className="text-primary font-bold">{ad.price} €</p>
                    </div>
                    
                    <Link 
                      // 🔴 CAMBIO 6: Usamos ad.id en el enlace
                      href={`/tienda/${ad.id}`}
                      className="text-xs text-center bg-primary text-white py-1 px-2 rounded mt-2 block hover:bg-blue-700 transition-colors"
                    >
                      Ver detalle
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}