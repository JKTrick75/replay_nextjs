import mongoose from 'mongoose';

// 1. USUARIO
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  image: { type: String },
  role: { type: String, default: 'user', enum: ['user', 'admin'] },
});

// 2. MARCA
const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  country: { type: String },
  logo: { type: String },
});

// 3. CONSOLA
const consoleSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  shortName: { type: String }, 
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  releaseYear: { type: Number }, 
  image: { type: String }, 
}); 

// 4. JUEGO
const gameSchema = new mongoose.Schema({
  title: { type: String, required: true },
  coverImage: { type: String },
  description: { type: String }, 
  genre: { type: String },
  releaseYear: { type: Number },
  platforms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Console' }],
});

// 5. ANUNCIO
const listingSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
  platform: { type: mongoose.Schema.Types.ObjectId, ref: 'Console', required: true },
  price: { type: Number, required: true },
  condition: { type: String, enum: ['Nuevo', 'Seminuevo', 'Usado'], required: true },
  description: { type: String },
  status: { type: String, default: 'active', enum: ['active', 'sold', 'reserved'] },
  photos: [{ type: String }],
  location: { lat: { type: Number }, lng: { type: Number }}
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Brand = mongoose.models.Brand || mongoose.model('Brand', brandSchema);
export const Console = mongoose.models.Console || mongoose.model('Console', consoleSchema);
export const Game = mongoose.models.Game || mongoose.model('Game', gameSchema);
export const Listing = mongoose.models.Listing || mongoose.model('Listing', listingSchema);