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
  brand?: Brand;
}

export interface Game {
  id: string;
  title: string;
  coverImage?: string | null;
  genre?: string | null;
  releaseYear?: number | null;
  description?: string | null;
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
  lat?: number | null;
  lng?: number | null;
  seller?: User; 
  game?: Game;      
  platform?: Console;
  photos?: string[];
}

// --- TIPOS FORMULARIOS ---
export type SimpleGame = { id: string; title: string; coverImage: string | null; genre: string };
export type SimpleConsole = { id: string; name: string };

export type ListingToEdit = {
  id: string;
  price: number;
  condition: string;
  description: string | null;
  gameId: string;
  platformId: string;
  game: { title: string; coverImage: string | null; genre?: string };
};

// 🟢 TIPO STATE DEFINITIVO
export type State = {
  errors?: {
    newGameTitle?: string[];
    coverImage?: string[];
    genre?: string[];
    platformId?: string[];
    price?: string[];
    condition?: string[];
    description?: string[];
    [key: string]: string[] | undefined;
  };
  message?: string | null;
  timestamp?: number; // Clave para forzar el repintado del formulario
  values?: {
    gameId?: string;
    gameSearch?: string;
    coverImage?: string;
    genre?: string;
    platformId?: string;
    price?: string;
    condition?: string;
    description?: string;
  };
};

// --- CARRITO CORREGIDO ---
export interface CartItem {
  id: string;
  cartId: string;
  listingId: string;
  listing: Listing;
  addedAt: Date;    // 🟢 Coincide con schema.prisma
  selected: boolean; // 🟢 Coincide con schema.prisma
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
}