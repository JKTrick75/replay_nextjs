import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { User, Brand, Console, Game, Listing } from '@/app/lib/models';

// --- COORDENADAS BASE (Ciudades de España) ---
const SPANISH_CITIES = [
  { name: 'Madrid', lat: 40.416775, lng: -3.703790 },
  { name: 'Barcelona', lat: 41.385064, lng: 2.173404 },
  { name: 'Valencia', lat: 39.469907, lng: -0.376288 },
  { name: 'Sevilla', lat: 37.389092, lng: -5.984459 },
  { name: 'Bilbao', lat: 43.263013, lng: -2.934985 },
  { name: 'Málaga', lat: 36.721261, lng: -4.421266 },
  { name: 'Zaragoza', lat: 41.648823, lng: -0.889085 },
  { name: 'Alicante', lat: 38.345996, lng: -0.490686 },
  { name: 'Vigo', lat: 42.240577, lng: -8.720727 },
  { name: 'Granada', lat: 37.177336, lng: -3.598557 },
  { name: 'Murcia', lat: 37.992240, lng: -1.130654 },
  { name: 'Palma', lat: 39.569600, lng: 2.650160 }
];

// --- DATOS RAW (Traducciones aplicadas) ---
const OLD_MARCAS = [
  { "_id": { "$oid": "69047fcd3bc991d7f84958e4" }, "nom": "Nintendo", "pais_origen": "Japón" },
  { "_id": { "$oid": "690480b73bc991d7f84958e9" }, "nom": "Sony", "pais_origen": "EEUU" },
  { "_id": { "$oid": "691379f728c1cdaa2d7cf1bb" }, "nom": "Microsoft", "pais_origen": "EEUU" }
];

const OLD_CONSOLAS = [
  { "_id": { "$oid": "69137ba428c1cdaa2d7cf1fe" }, "nom": "PlayStation 1", "any_eixida": 1994, "marca_id": { "$oid": "690480b73bc991d7f84958e9" }, "foto": "https://imgs.search.brave.com/yLOfOCMUbl6KwAcr9ctPd8GMXZM_umAwlYmy0Qx00u0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMjE5/NzUxMDgyMy9mci9w/aG90by9zb255LXBs/YXlzdGF0aW9uLTEt/dmlkZW8tZ2FtZS1j/b25zb2xlLmpwZz9z/PTYxMng2MTImdz0w/Jms9MjAmYz1qU21i/OVhBXzluMzh4LVpk/V0dNc1ZiM3VwbERf/M0FwdGs0MjVXcU1w/TUtVPQ" },
  { "_id": { "$oid": "69137bb328c1cdaa2d7cf200" }, "nom": "PlayStation 2", "any_eixida": 2000, "marca_id": { "$oid": "690480b73bc991d7f84958e9" }, "foto": "https://imgs.search.brave.com/jPhxvz47YdX9bKF3_5wtk1JopTk9FtzFQtXS0ZrwNyA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy8w/LzAzL1BTMi1TbGlt/LUNvbnNvbGUtU2V0/LmpwZw" },
  { "_id": { "$oid": "69137bc428c1cdaa2d7cf202" }, "nom": "PlayStation 3", "any_eixida": 2006, "marca_id": { "$oid": "690480b73bc991d7f84958e9" }, "foto": "https://imgs.search.brave.com/DzvvboIMRLfGDhxOHfZMmfTVAoMZs51EJh-GnAgTt0w/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvNDU4/NTkzMDkzL3Bob3Rv/L3NvbnktcGxheXN0/YXRpb24tMy13aXRo/LWNvbnRyb2xsZXIu/anBnP3M9NjEyeDYx/MiZ3PTAmaz0yMCZj/PThMQlRrVjF3MThP/X3ZMUDl2N2JQVGhV/YmpybzB4SlIzbnQ5/X19GTlRxYWs9" },
  { "_id": { "$oid": "69137bcd28c1cdaa2d7cf204" }, "nom": "PlayStation 4", "any_eixida": 2013, "marca_id": { "$oid": "690480b73bc991d7f84958e9" }, "foto": "https://imgs.search.brave.com/-lx0mUApraGU0qYC2gsfwrjMcdyXksb2d9j7KaB6WXc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvODUw/NjgxMDY0L3Bob3Rv/L3NvbnktcGxheXN0/YXRpb24tNC1nYW1l/LWNvbnNvbGUtd2l0/aC1hLWpveXN0aWNr/LWR1YWxzaG9jay00/LWhvbWUtdmlkZW8t/Z2FtZS1jb25zb2xl/LWRldmVsb3BlZC5q/cGc_cz02MTJ4NjEy/Jnc9MCZrPTIwJmM9/M1ZCYVJLQjY5TFVP/MWRaN3pwVFVJRGxk/aExBNzBRQ1U5SGNB/YVk4QXlMbz0" },
  { "_id": { "$oid": "69137bdc28c1cdaa2d7cf206" }, "nom": "PlayStation 5", "any_eixida": 2020, "marca_id": { "$oid": "690480b73bc991d7f84958e9" }, "foto": "https://imgs.search.brave.com/CIlHpm-0VY8WvVR6QW1zbZEx7FM0oK5uZRyi0T6-_YU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTU4/MDkyMDAwNS9waG90/by9wbGF5c3RhdGlv/bi1kdWFsc2Vuc2Ut/Y29udHJvbGxlci1h/bmQtcGxheXN0YXRp/b24tNS1jb25zb2xl/LWFyZS1zZWVuLWlu/LXRoaXMtaWxsdXN0/cmF0aW9uLmpwZz9z/PTYxMng2MTImdz0w/Jms9MjAmYz1ZRlNF/d0h5VnBxMGw0Ulg0/OGJ5aVVXWmpIbFZl/bFVDSnQzLWk2c0JF/YS1FPQ" },
  { "_id": { "$oid": "69137bec28c1cdaa2d7cf208" }, "nom": "PSP", "any_eixida": 2004, "marca_id": { "$oid": "690480b73bc991d7f84958e9" }, "foto": "https://imgs.search.brave.com/St3aPBCbQIGhIFjDBfb_h6RMQdfOMgtfGYTAx1mCJTk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NjE0dlF4Zk1jTEwu/anBn" },
  { "_id": { "$oid": "69137bfc28c1cdaa2d7cf20a" }, "nom": "PS Vita", "any_eixida": 2011, "marca_id": { "$oid": "690480b73bc991d7f84958e9" }, "foto": "https://imgs.search.brave.com/I9YQq4p93g-yVAdQrE19MCBDCkpaJzEz0LBF5WKc5aA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvNDU5/MDEwNjc5L3Bob3Rv/L3BsYXlzdGF0aW9u/LXZpdGEuanBnP3M9/NjEyeDYxMiZ3PTAm/az0yMCZjPXJ1bG1H/RGJza2xtRGxIUWZm/Y2dDWVF5MVJ5ekxp/dWZCUWFJX0FkS0N3/TWM9" },
  { "_id": { "$oid": "69137c0828c1cdaa2d7cf20c" }, "nom": "Xbox", "any_eixida": 2001, "marca_id": { "$oid": "691379f728c1cdaa2d7cf1bb" }, "foto": "https://imgs.search.brave.com/j-Xa8h33XCJhw0_bTSPsgyLM2Bq3CntTiP9A9Kls4Ro/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvOTAx/MDg4L3Bob3RvL21p/Y3Jvc29mdHMteGJv/eC12aWRlby1nYW1l/LWNvbnNvbGUtaXMt/b24tZGlzcGxheS1p/bi1hbi11bmRhdGVk/LXBob3RvLXRoZS14/Ym94LWFkdmVydGlz/ZXMtd2l0aC5qcGc_/cz02MTJ4NjEyJnc9/MCZrPTIwJmM9dnFL/ZWY2OG5NaXplZTNK/MjhzMUlIRmlTUElR/cWxnMnl4RG9kdjEz/Y29vND0" },
  { "_id": { "$oid": "69137c1728c1cdaa2d7cf20e" }, "nom": "Xbox 360", "any_eixida": 2005, "marca_id": { "$oid": "691379f728c1cdaa2d7cf1bb" }, "foto": "https://imgs.search.brave.com/d_7G6ac0S5PGaE70-MvJn6CMTakxwuXGUYWmG260AAg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMtbmEuc3NsLWlt/YWdlcy1hbWF6b24u/Y29tL2ltYWdlcy9J/LzYxb0Zxc29qOW5M/LmpwZw" },
  { "_id": { "$oid": "69137c2c28c1cdaa2d7cf210" }, "nom": "Xbox One", "any_eixida": 2013, "marca_id": { "$oid": "691379f728c1cdaa2d7cf1bb" }, "foto": "https://imgs.search.brave.com/GzNZmbteK9zOMgAD6r89k3beSMbMpsnORlkWzZH-n_k/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/bW9zLmNtcy5mdXR1/cmVjZG4ubmV0Lzl2/aGJoVnJkaXlaMnhG/UlJZV05aajguanBn" },
  { "_id": { "$oid": "69137c3628c1cdaa2d7cf212" }, "nom": "Xbox Series X", "any_eixida": 2020, "marca_id": { "$oid": "691379f728c1cdaa2d7cf1bb" }, "foto": "https://imgs.search.brave.com/ekCkfBrjGkUcziUGQIFGAOSZsrkjPShozUFtQscwBEg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJzLmNvbS9p/bWFnZXMvaGQvYmxh/Y2steGJveC1zZXJp/ZXMteC1zZXQtNzV5/Nmxmem9vOXdra3hm/cC5qcGc" },
  { "_id": { "$oid": "69137c3c28c1cdaa2d7cf214" }, "nom": "Nintendo Switch", "any_eixida": 2017, "marca_id": { "$oid": "69047fcd3bc991d7f84958e4" }, "foto": "https://imgs.search.brave.com/Tl4YtKB3LVnxfzIZKheGpiOOwrfc1frye5_MzlgmFbw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9hc3Nl/dHMubmludGVuZG8u/ZXUvaW1hZ2UvdXBs/b2FkL2ZfYXV0byxj/X2xpbWl0LHdfNDAw/LHFfYXV0bzplY286/c2Vuc2l0aXZlL01O/Uy9Db250ZW50JTIw/UGFnZXMlMjBBc3Nl/dHMvQ2F0ZWdvcnkt/TGlzdCUyMFBhZ2Vz/L0NvbnNvbGVzL05p/bnRlbmRvJTIwU3dp/dGNoJTIwSHViLzIw/MDB4MTEyNV9Db25z/b2xlc19Td2l0Y2hf/RmxhZ3NoaXBfQmVh/dXR5U2hvdA" },
  { "_id": { "$oid": "69137c5628c1cdaa2d7cf216" }, "nom": "Nintendo Switch 2", "any_eixida": 2025, "marca_id": { "$oid": "69047fcd3bc991d7f84958e4" }, "foto": "https://imgs.search.brave.com/pzZ4n9XWJ0Ln1Uqww_herwLObql5JMDClreMoyLKbeo/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/bmludGVuZG8uY29t/L3NnL3N3aXRjaDIv/YXNzZXRzL2ltZy90/b3Avc3dpdGNoMl9t/b3ZpZV90aHVtLmpw/Zw" },
  { "_id": { "$oid": "69137c7828c1cdaa2d7cf218" }, "nom": "Nintendo DS", "any_eixida": 2004, "marca_id": { "$oid": "69047fcd3bc991d7f84958e4" }, "foto": "https://imgs.search.brave.com/0UkzvcPTK8qS-LrGLx983SyO6akICwWTI2nGIgz7VJ8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jYXZl/Z2FtZXJzLmNvbS9j/ZG4vc2hvcC9wcm9k/dWN0cy8yNDcxXzIu/anBnP3Y9MTc0NDc0/NTg4NSZ3aWR0aD02/NDA" },
  { "_id": { "$oid": "69137c8328c1cdaa2d7cf21a" }, "nom": "Nintendo Wii", "any_eixida": 2006, "marca_id": { "$oid": "69047fcd3bc991d7f84958e4" }, "foto": "https://imgs.search.brave.com/TZ3jyGDmRW1hKPJ5RufEipDpeWXZVUstLjq3u9otquI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NTE0THBOZ1FlTEwu/anBn" }
];

const OLD_JUEGOS = [
  { "nom": "Elden Ring", "genero": "RPG de Acción", "foto": "https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp", "consolas_disponibles": [{ "$oid": "69137bcd28c1cdaa2d7cf204" }, { "$oid": "69137bdc28c1cdaa2d7cf206" }, { "$oid": "69137c2c28c1cdaa2d7cf210" }, { "$oid": "69137c3628c1cdaa2d7cf212" }] },
  { "nom": "The Legend of Zelda: Tears of the Kingdom", "genero": "Aventura", "foto": "https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.webp", "consolas_disponibles": [{ "$oid": "69137c3c28c1cdaa2d7cf214" }] },
  { "nom": "Grand Theft Auto V", "genero": "Mundo Abierto", "foto": "https://images.igdb.com/igdb/image/upload/t_cover_big/co2lbd.webp", "consolas_disponibles": [{ "$oid": "69137bc428c1cdaa2d7cf202" }, { "$oid": "69137bcd28c1cdaa2d7cf204" }, { "$oid": "69137bdc28c1cdaa2d7cf206" }, { "$oid": "69137c1728c1cdaa2d7cf20e" }, { "$oid": "69137c2c28c1cdaa2d7cf210" }, { "$oid": "69137c3628c1cdaa2d7cf212" }] },
  { "nom": "Red Dead Redemption 2", "genero": "Mundo Abierto", "foto": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.webp", "consolas_disponibles": [{ "$oid": "69137bcd28c1cdaa2d7cf204" }, { "$oid": "69137c2c28c1cdaa2d7cf210" }] },
  { "nom": "Minecraft", "genero": "Sandbox", "foto": "https://images.igdb.com/igdb/image/upload/t_cover_big/co8fu7.webp", "consolas_disponibles": [{ "$oid": "69137bc428c1cdaa2d7cf202" }, { "$oid": "69137bcd28c1cdaa2d7cf204" }, { "$oid": "69137bdc28c1cdaa2d7cf206" }, { "$oid": "69137bfc28c1cdaa2d7cf20a" }, { "$oid": "69137c1728c1cdaa2d7cf20e" }, { "$oid": "69137c2c28c1cdaa2d7cf210" }, { "$oid": "69137c3628c1cdaa2d7cf212" }, { "$oid": "69137c8328c1cdaa2d7cf21a" }, { "$oid": "69137c3c28c1cdaa2d7cf214" }, { "$oid": "69137c7828c1cdaa2d7cf218" }] },
  { "nom": "God of War Ragnarök", "genero": "Acción / Aventura", "foto": "https://images.igdb.com/igdb/image/upload/t_cover_big/co5s5v.webp", "consolas_disponibles": [{ "$oid": "69137bcd28c1cdaa2d7cf204" }, { "$oid": "69137bdc28c1cdaa2d7cf206" }] },
  { "nom": "Halo Infinite", "genero": "Shooter", "foto": "https://images.igdb.com/igdb/image/upload/t_cover_big/co2dto.webp", "consolas_disponibles": [{ "$oid": "69137c2c28c1cdaa2d7cf210" }, { "$oid": "69137c3628c1cdaa2d7cf212" }] },
  { "nom": "Super Mario Odyssey", "genero": "Plataformas", "foto": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1mxf.webp", "consolas_disponibles": [{ "$oid": "69137c3c28c1cdaa2d7cf214" }] },
  { "nom": "Cyberpunk 2077", "genero": "RPG", "foto": "https://images.igdb.com/igdb/image/upload/t_cover_big/coaih8.webp", "consolas_disponibles": [{ "$oid": "69137bcd28c1cdaa2d7cf204" }, { "$oid": "69137bdc28c1cdaa2d7cf206" }, { "$oid": "69137c2c28c1cdaa2d7cf210" }, { "$oid": "69137c3628c1cdaa2d7cf212" }] },
  { "nom": "The Witcher 3: Wild Hunt", "genero": "RPG", "foto": "https://images.igdb.com/igdb/image/upload/t_cover_big/coaarl.webp", "consolas_disponibles": [{ "$oid": "69137bcd28c1cdaa2d7cf204" }, { "$oid": "69137bdc28c1cdaa2d7cf206" }, { "$oid": "69137c2c28c1cdaa2d7cf210" }, { "$oid": "69137c3628c1cdaa2d7cf212" }, { "$oid": "69137c3c28c1cdaa2d7cf214" }] },
  { "nom": "Animal Crossing: New Horizons", "genero": "Simulación", "foto": "https://images.igdb.com/igdb/image/upload/t_cover_big/co3wls.webp", "consolas_disponibles": [{ "$oid": "69137c3c28c1cdaa2d7cf214" }] },
  { "nom": "Call of Duty: Modern Warfare III", "genero": "Shooter", "foto": "https://images.igdb.com/igdb/image/upload/t_cover_big/co7ctx.webp", "consolas_disponibles": [{ "$oid": "69137bcd28c1cdaa2d7cf204" }, { "$oid": "69137bdc28c1cdaa2d7cf206" }, { "$oid": "69137c2c28c1cdaa2d7cf210" }, { "$oid": "69137c3628c1cdaa2d7cf212" }] },
  { "nom": "Final Fantasy VII Rebirth", "genero": "JRPG", "foto": "https://images.igdb.com/igdb/image/upload/t_cover_big/co73ju.webp", "consolas_disponibles": [{ "$oid": "69137bdc28c1cdaa2d7cf206" }] },
  { "nom": "Marvel's Spider-Man 2", "genero": "Acción / Aventura", "foto": "https://images.igdb.com/igdb/image/upload/t_cover_big/co79vq.webp", "consolas_disponibles": [{ "$oid": "69137bdc28c1cdaa2d7cf206" }] },
  { "nom": "Forza Horizon 5", "genero": "Conducción", "foto": "https://images.igdb.com/igdb/image/upload/t_cover_big/co3ofx.webp", "consolas_disponibles": [{ "$oid": "69137c2c28c1cdaa2d7cf210" }, { "$oid": "69137c3628c1cdaa2d7cf212" }] },
  { "nom": "Pokémon Scarlet", "genero": "RPG", "foto": "https://images.igdb.com/igdb/image/upload/t_cover_big/co5sfi.webp", "consolas_disponibles": [{ "$oid": "69137c3c28c1cdaa2d7cf214" }] },
  { "nom": "Hogwarts Legacy", "genero": "RPG de Acción", "foto": "https://images.igdb.com/igdb/image/upload/t_cover_big/coaav6.webp", "consolas_disponibles": [{ "$oid": "69137bcd28c1cdaa2d7cf204" }, { "$oid": "69137bdc28c1cdaa2d7cf206" }, { "$oid": "69137c2c28c1cdaa2d7cf210" }, { "$oid": "69137c3628c1cdaa2d7cf212" }, { "$oid": "69137c3c28c1cdaa2d7cf214" }] },
  { "nom": "Metal Gear Solid 3: Snake Eater", "genero": "Sigilo", "foto": "https://images.igdb.com/igdb/image/upload/t_cover_big/co99jz.webp", "consolas_disponibles": [{ "$oid": "69137bb328c1cdaa2d7cf200" }, { "$oid": "69137c1728c1cdaa2d7cf20e" }, { "$oid": "69137bfc28c1cdaa2d7cf20a" }, { "$oid": "69137c7828c1cdaa2d7cf218" }] },
  { "nom": "Uncharted 4: A Thief's End", "genero": "Acción / Aventura", "foto": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7h.webp", "consolas_disponibles": [{ "$oid": "69137bcd28c1cdaa2d7cf204" }, { "$oid": "69137bdc28c1cdaa2d7cf206" }] },
  { "nom": "Halo 3", "genero": "Shooter", "foto": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1xhc.webp", "consolas_disponibles": [{ "$oid": "69137c1728c1cdaa2d7cf20e" }, { "$oid": "69137c2c28c1cdaa2d7cf210" }, { "$oid": "69137c3628c1cdaa2d7cf212" }] },
  { "nom": "The Last of Us Part I", "genero": "Aventura / Terror", "foto": "https://images.igdb.com/igdb/image/upload/t_cover_big/coa1gq.webp", "consolas_disponibles": [{ "$oid": "69137bdc28c1cdaa2d7cf206" }] },
  { "nom": "The Last of Us Remastered", "genero": "Aventura / Terror", "foto": "https://images.igdb.com/igdb/image/upload/t_cover_big/co5zks.webp", "consolas_disponibles": [{ "$oid": "69137bc428c1cdaa2d7cf202" }, { "$oid": "69137bcd28c1cdaa2d7cf204" }] },
  { "nom": "Persona 5 Royal", "genero": "JRPG", "foto": "https://images.igdb.com/igdb/image/upload/t_cover_big/coaasg.webp", "consolas_disponibles": [{ "$oid": "69137bcd28c1cdaa2d7cf204" }, { "$oid": "69137bdc28c1cdaa2d7cf206" }, { "$oid": "69137c2c28c1cdaa2d7cf210" }, { "$oid": "69137c3628c1cdaa2d7cf212" }, { "$oid": "69137c3c28c1cdaa2d7cf214" }] },
  { "nom": "Super Smash Bros. Ultimate", "genero": "Lucha", "foto": "https://images.igdb.com/igdb/image/upload/t_cover_big/co2255.webp", "consolas_disponibles": [{ "$oid": "69137c3c28c1cdaa2d7cf214" }] },
  { "nom": "Wii Sports", "genero": "Deportes", "foto": "https://images.igdb.com/igdb/image/upload/t_cover_big/co3vge.webp", "consolas_disponibles": [{ "$oid": "69137c8328c1cdaa2d7cf21a" }] },
  { "nom": "New Super Mario Bros.", "genero": "Plataformas", "foto": "https://images.igdb.com/igdb/image/upload/t_cover_big/co21rm.webp", "consolas_disponibles": [{ "$oid": "69137c7828c1cdaa2d7cf218" }] },
  { "nom": "God of War", "genero": "Hack and Slash", "foto": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1tmu.webp", "consolas_disponibles": [{ "$oid": "69137bb328c1cdaa2d7cf200" }, { "$oid": "69137bc428c1cdaa2d7cf202" }, { "$oid": "69137bfc28c1cdaa2d7cf20a" }] },
  { "nom": "Gran Turismo 7", "genero": "Conducción", "foto": "https://images.igdb.com/igdb/image/upload/t_cover_big/co2g84.webp", "consolas_disponibles": [{ "$oid": "69137bcd28c1cdaa2d7cf204" }, { "$oid": "69137bdc28c1cdaa2d7cf206" }] },
  { "nom": "Gears of War 3", "genero": "Shooter", "foto": "https://images.igdb.com/igdb/image/upload/t_cover_big/co2a21.webp", "consolas_disponibles": [{ "$oid": "69137c1728c1cdaa2d7cf20e" }, { "$oid": "69137c2c28c1cdaa2d7cf210" }, { "$oid": "69137c3628c1cdaa2d7cf212" }] },
  { "nom": "Crash Bandicoot", "genero": "Plataformas", "foto": "https://images.igdb.com/igdb/image/upload/t_cover_big/co555l.webp", "consolas_disponibles": [{ "$oid": "69137ba428c1cdaa2d7cf1fe" }] },
  { "nom": "Monster Hunter Rise", "genero": "RPG de Acción", "foto": "https://images.igdb.com/igdb/image/upload/t_cover_big/co3uzk.webp", "consolas_disponibles": [{ "$oid": "69137c3c28c1cdaa2d7cf214" }, { "$oid": "69137bcd28c1cdaa2d7cf204" }, { "$oid": "69137bdc28c1cdaa2d7cf206" }, { "$oid": "69137c2c28c1cdaa2d7cf210" }, { "$oid": "69137c3628c1cdaa2d7cf212" }] },
  { "nom": "Baldur's Gate 3", "genero": "RPG", "foto": "https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.webp", "consolas_disponibles": [{ "$oid": "69137bdc28c1cdaa2d7cf206" }, { "$oid": "69137c3628c1cdaa2d7cf212" }] },
  { "nom": "Hollow Knight: Silksong", "genero": "Metroidvania", "foto": "https://images.igdb.com/igdb/image/upload/t_cover_big/coaend.webp", "consolas_disponibles": [{ "$oid": "69137bdc28c1cdaa2d7cf206" }, { "$oid": "69137c3628c1cdaa2d7cf212" }, { "$oid": "69137c5628c1cdaa2d7cf216" }, { "$oid": "69137c3c28c1cdaa2d7cf214" }, { "$oid": "69137bcd28c1cdaa2d7cf204" }, { "$oid": "69137c2c28c1cdaa2d7cf210" }] }
];


export async function GET() {
  try {
    await connectDB();
    
    // 1. Limpieza total PROFUNDA
    try { await Listing.collection.drop(); } catch (error) {}
    try { await Game.collection.drop(); } catch (error) {}
    try { await Console.collection.drop(); } catch (error) {}
    try { await Brand.collection.drop(); } catch (error) {}
    try { await User.collection.drop(); } catch (error) {}

    // 2. Crear Usuarios
    const user1 = await User.create({
      name: 'David Gamer',
      email: 'david@example.com',
      password: 'password123',
      role: 'admin',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David'
    });

    const user2 = await User.create({
      name: 'Maria Vendedora',
      email: 'maria@example.com',
      password: 'password123',
      role: 'user',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria'
    });

    // 3. Crear Marcas y Mapa
    const brandMap: Record<string, string> = {}; 
    for (const oldBrand of OLD_MARCAS) {
      const newBrand = await Brand.create({
        name: oldBrand.nom,
        country: oldBrand.pais_origen
      });
      brandMap[oldBrand._id.$oid] = newBrand._id.toString();
    }

    // 4. Crear Consolas y Mapa
    const consoleMap: Record<string, any> = {}; 
    for (const oldConsole of OLD_CONSOLAS) {
      const newBrandId = brandMap[oldConsole.marca_id.$oid];
      if (!newBrandId) continue; 

      const newConsole = await Console.create({
        name: oldConsole.nom,
        shortName: oldConsole.nom.replace("Nintendo ", "").replace("PlayStation ", "PS").replace("Microsoft ", ""),
        brand: newBrandId,
        releaseYear: oldConsole.any_eixida,
        image: oldConsole.foto
      });
      consoleMap[oldConsole._id.$oid] = newConsole;
    }

    // 5. Crear Juegos
    const createdGames = [];

    for (const oldGame of OLD_JUEGOS) {
      const newPlatformIds = oldGame.consolas_disponibles.map((oldObj: any) => {
        const consoleDoc = consoleMap[oldObj.$oid];
        return consoleDoc ? consoleDoc._id : null;
      }).filter((id: any) => id !== null);

      const newGame = await Game.create({
        title: oldGame.nom,
        genre: oldGame.genero,
        coverImage: oldGame.foto,
        platforms: newPlatformIds
      });
      createdGames.push(newGame);
    }

    // 6. Generar Anuncios CON UBICACIÓN ESPAÑOLA
    let listingsCount = 0;
    const conditions = ['Nuevo', 'Seminuevo', 'Usado'];

    for (const game of createdGames) {
      if (game.platforms.length > 0) {
        const randomPlatformId = game.platforms[Math.floor(Math.random() * game.platforms.length)];
        const randomUser = Math.random() > 0.5 ? user1 : user2;

        // --- LÓGICA DE UBICACIÓN ---
        // 1. Elegimos una ciudad de España al azar
        const city = SPANISH_CITIES[Math.floor(Math.random() * SPANISH_CITIES.length)];
        
        // 2. Le damos un pequeño "jitter" (desviación aleatoria) para que no caigan todos en el mismo pixel
        // Variación aprox de +/- 0.05 grados (unos 5-8 km)
        const jitterLat = (Math.random() - 0.5) * 0.1;
        const jitterLng = (Math.random() - 0.5) * 0.1;

        await Listing.create({
          seller: randomUser._id,
          game: game._id,
          platform: randomPlatformId,
          price: Math.floor(Math.random() * 60) + 10, 
          condition: conditions[Math.floor(Math.random() * conditions.length)],
          description: `Vendo ${game.title} en perfecto estado. Entrega en mano en ${city.name} o envío.`,
          status: 'active',
          // 👇 Aquí insertamos las coordenadas generadas
          location: {
            lat: city.lat + jitterLat,
            lng: city.lng + jitterLng
          }
        });
        listingsCount++;
      }
    }

    return NextResponse.json({ 
      message: 'Base de datos limpia, en español y geolocalizada con éxito 🇪🇸🗺️', 
      stats: {
        brands: Object.keys(brandMap).length,
        consolas: Object.keys(consoleMap).length,
        games: createdGames.length,
        listings: listingsCount
      }
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}