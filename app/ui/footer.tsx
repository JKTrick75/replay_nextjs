import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-dark text-white pt-12 pb-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Columna 1: Marca e Info */}
        <div>
          <h3 className="text-2xl font-bold text-primary mb-4">Replay</h3>
          <div className="text-sm text-gray-light space-y-2 opacity-80">
            <p>info@replay.com</p>
            <p>+34 123 456 789</p>
            <p>Valencia, España</p>
          </div>
        </div>

        {/* Columna 2: Enlaces */}
        <div>
          <h4 className="font-bold text-lg mb-4">Enlaces útiles</h4>
          <ul className="space-y-2 text-sm text-gray-light opacity-80">
            <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li><Link href="/tienda" className="hover:text-primary transition-colors">Tienda</Link></li>
            <li><Link href="#" className="hover:text-primary transition-colors">Cómo funciona</Link></li>
          </ul>
        </div>

        {/* Columna 3: Legal */}
        <div>
          <h4 className="font-bold text-lg mb-4">Empresa</h4>
          <ul className="space-y-2 text-sm text-gray-light opacity-80">
            <li><Link href="#" className="hover:text-primary transition-colors">Sobre nosotros</Link></li>
            <li><Link href="#" className="hover:text-primary transition-colors">Aviso Legal</Link></li>
          </ul>
        </div>

        {/* Columna 4: Social (Simulado) */}
        <div>
          <h4 className="font-bold text-lg mb-4">Síguenos</h4>
          <div className="flex space-x-3">
            <div className="w-8 h-8 bg-gray rounded-full flex items-center justify-center hover:bg-primary cursor-pointer transition-colors text-xs font-bold">IG</div>
            <div className="w-8 h-8 bg-gray rounded-full flex items-center justify-center hover:bg-primary cursor-pointer transition-colors text-xs font-bold">X</div>
            <div className="w-8 h-8 bg-gray rounded-full flex items-center justify-center hover:bg-primary cursor-pointer transition-colors text-xs font-bold">FB</div>
          </div>
        </div>
      </div>
      
      {/* Copyright */}
      <div className="text-center text-xs text-gray-light opacity-50 mt-12 border-t border-gray pt-6">
        © 2025 Replay. Proyecto Final 2º DAW.
      </div>
    </footer>
  );
}