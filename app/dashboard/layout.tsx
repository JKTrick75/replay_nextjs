import SideNav from '@/app/ui/dashboard/sidenav';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    // 1. CAMBIO: 'min-h-screen' en vez de 'h-screen' para que crezca.
    // 2. CAMBIO: Quitamos 'md:overflow-hidden' para permitir el scroll de la página completa.
    <div className="flex min-h-screen flex-col md:flex-row bg-white-off dark:bg-neutral-900">
      
      {/* BARRA LATERAL (Fija en Desktop) */}
      <div className="w-full flex-none md:w-64 border-b md:border-b-0 md:border-r border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 z-10">
        <SideNav />
      </div>

      {/* CONTENIDO PRINCIPAL */}
      {/* 3. CAMBIO: Quitamos 'md:overflow-y-auto' para que no tenga su propia barra de scroll */}
      <div className="grow p-6 md:p-12">
        {children}
      </div>
      
    </div>
  );
}