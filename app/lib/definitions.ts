// app/lib/definitions.ts

export interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: 'user' | 'admin';
}

export interface Brand {
  _id: string;
  name: string;
  country?: string;
  logo?: string;
}

export interface Console {
  _id: string;
  name: string;
  shortName: string;
  brand: Brand | string; 
  releaseYear?: number;
  image?: string;
}

export interface Game {
  _id: string;
  title: string;
  coverImage?: string;
  genre?: string;
  releaseYear?: number;
  description?: string;
  platforms: Console[] | string[]; 
}

export interface Listing {
  _id: string;
  price: number;
  condition: 'Nuevo' | 'Seminuevo' | 'Usado';
  description?: string;
  status: 'active' | 'sold' | 'reserved';
  seller: User; 
  game: Game;      
  platform: Console; 
  createdAt: string;
  location?: {
    lat: number;
    lng: number;
  };
}