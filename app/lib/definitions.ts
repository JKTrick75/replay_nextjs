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
  
  // IDs de relación
  sellerId: string;
  buyerId?: string | null; // 🟢 [Nuevo] Coincide con schema.prisma
  gameId: string;
  platformId: string;
  
  // Datos temporales
  createdAt: Date;
  soldAt?: Date | null;    // 🟢 [Nuevo] Coincide con schema.prisma
  
  // Ubicación
  lat?: number | null;
  lng?: number | null;
  
  // Logística 🟢 [Nuevo] (Soluciona los errores del formulario)
  shippingAddress?: string | null;
  deliveryStatus?: string; // 'pending', 'shipped', 'delivered'

  // Relaciones completas
  seller?: User; 
  buyer?: User | null;     // 🟢 [Nuevo] Coincide con schema.prisma
  game?: Game;      
  platform?: Console;
  photos?: string[];       // Lo mantenemos opcional por si decides usarlo
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
  timestamp?: number;
  success?: boolean; 
  values?: {
    gameId?: string;
    gameSearch?: string;
    coverImage?: string;
    genre?: string;
    platformId?: string;
    price?: string;
    condition?: string;
    description?: string;
    [key: string]: string | undefined;
  };
};

// --- CARRITO ---
export interface CartItem {
  id: string;
  cartId: string;
  listingId: string;
  listing: Listing;
  addedAt: Date;
  selected: boolean;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
}