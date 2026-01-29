// app/lib/definitions.ts

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: string;
  city?: string | null;
  lat?: number | null;
  lng?: number | null;
}

export interface Brand {
  id: string;
  name: string;
  country?: string | null;
  logo?: string | null;
}

export interface Console {
  id: string;
  name: string;
  shortName?: string | null;
  brandId: string;
  releaseYear?: number | null;
  image?: string | null;
  // Relación opcional para la UI
  brand?: Brand;
}

export interface Game {
  id: string;
  title: string;
  coverImage?: string | null;
  genre?: string | null;
  releaseYear?: number | null;
  description?: string | null;
  // Relación opcional
  platforms?: Console[]; 
}

export interface Listing {
  id: string;
  price: number;
  condition: 'Nuevo' | 'Seminuevo' | 'Usado' | string;
  description?: string | null;
  status: 'active' | 'sold' | 'reserved' | string;
  
  sellerId: string;
  gameId: string;
  platformId: string;
  
  createdAt: Date;
  
  // Ubicación aplanada
  lat?: number | null;
  lng?: number | null;

  // Relaciones completas (se rellenan con 'include' en Prisma)
  seller?: User; 
  game?: Game;      
  platform?: Console;
  
  // Para el frontend lo mantenemos simple: solo una lista de URLs
  photos?: string[];
}

// --- TIPO GLOBAL PARA EL ESTADO DE LOS FORMULARIOS (SERVER ACTIONS) ---
export type State = {
  errors?: {
    [key: string]: string[] | undefined;
  };
  message?: string | null;
};