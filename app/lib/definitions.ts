//Usuario
export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: string;
  city?: string | null;
  lat?: number | null;
  lng?: number | null;

  sales?: Listing[];
  reviewsWritten?: Review[];
  reviewsReceived?: Review[];
  
  _count?: {
    sales?: number;
    reviewsReceived?: number;
    chatsAsBuyer?: number;
    chatsAsSeller?: number;
  };
}

//Marcas
export interface Brand {
  id: string;
  name: string;
  country?: string | null;
  logo?: string | null;
}

//Plataformas
export interface Console {
  id: string;
  name: string;
  shortName?: string | null;
  brandId: string;
  releaseYear?: number | null;
  image?: string | null;
  brand?: Brand;
}

//Juegos base
export interface Game {
  id: string;
  title: string;
  coverImage?: string | null;
  genre?: string | null;
  releaseYear?: number | null;
  description?: string | null;
  platforms?: Console[]; 
}

//Valoraciones
export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  
  buyerId: string;
  sellerId: string;
  listingId: string;

  buyer?: User;
  seller?: User;
}

//Pedidos
export interface Listing {
  id: string;
  price: number;
  condition: 'Nuevo' | 'Seminuevo' | 'Usado' | string;
  description?: string | null;
  status: 'active' | 'sold' | 'reserved' | string;
  
  //IDs de relación
  sellerId: string;
  buyerId?: string | null; 
  gameId: string;
  platformId: string;
  
  //Datos temporales
  createdAt: Date;
  soldAt?: Date | null;    
  
  //Ubicación
  lat?: number | null;
  lng?: number | null;
  
  //Logística
  shippingAddress?: string | null;
  deliveryStatus?: string;

  //Relaciones completas
  seller?: User; 
  buyer?: User | null;     
  game?: Game;      
  platform?: Console;
  photos?: string[];       

  review?: Review | null;
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

//Estados globales
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

//CARRITO
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

//CHAT
export interface Message {
  id: string;
  content: string;
  image?: string | null;
  createdAt: Date;
  read: boolean;
  senderId: string;
  chatId: string;
  
  sender?: User;
}

//MENSAJES
export interface Chat {
  id: string;
  buyerId: string;
  sellerId: string;
  listingId?: string | null;
  updatedAt: Date;
  
  buyer?: User;
  seller?: User;
  listing?: Listing | null;
  messages?: Message[];
}