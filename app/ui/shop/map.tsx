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

// Centro por defecto (Madrid, España)
const DEFAULT_CENTER: [number, number] = [40.416775, -3.703790];

export default function ShopMap({ listings }: { listings: Listing[] }) {
  
  // LÓGICA DE CENTRADO INTELIGENTE
  let center: [number, number] = DEFAULT_CENTER;
  let zoom = 6;

  // Si solo hay un anuncio y tiene ubicación, nos centramos en él y hacemos zoom
  if (listings.length === 1 && listings[0].location) {
    center = [listings[0].location.lat, listings[0].location.lng];
    zoom = 13; // Zoom nivel ciudad/barrio
  }

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        key={`${center[0]}-${center[1]}`} // Clave para forzar re-render si cambia el centro
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={false} // Desactivamos scroll para mejor UX en detalle
        className="h-full w-full"
        style={{ background: '#262626' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="dark:filter dark:invert dark:grayscale dark:contrast-75" 
        />

        {listings.map((ad) => {
          const lat = ad.location?.lat || DEFAULT_CENTER[0];
          const lng = ad.location?.lng || DEFAULT_CENTER[1];

          return (
            <Marker 
              key={ad._id} 
              position={[lat, lng]} 
              icon={iconDefault}
            >
              <Popup className="custom-popup">
                <div className="flex flex-col gap-2 min-w-37.5">
                  <div className="h-24 w-full bg-gray-200 rounded-md overflow-hidden relative">
                    <img 
                      src={ad.game.coverImage || '/placeholder.png'} 
                      alt={ad.game.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div>
                    <p className="font-bold text-sm truncate text-gray-900">{ad.game.title}</p>
                    <div className="flex justify-between items-center mt-1">
                        <span className="text-xs font-semibold bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                            {ad.condition}
                        </span>
                        <p className="text-primary font-bold">{ad.price} €</p>
                    </div>
                    
                    <Link 
                      href={`/tienda/${ad._id}`}
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