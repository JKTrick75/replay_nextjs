import SideNav from '@/app/ui/dashboard/sidenav';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-white-off dark:bg-neutral-900">
      
      {/* BARRA LATERAL (Fija en Desktop) */}
      <div className="w-full flex-none md:w-64 border-b md:border-b-0 md:border-r border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 z-10">
        <SideNav />
      </div>

      {/* CONTENIDO PRINCIPAL (Scrollable) */}
      <div className="grow p-6 md:overflow-y-auto md:p-12">
        {children}
      </div>
      
    </div>
  );
}