import { prisma } from '@/app/lib/db';
import { Users, ShoppingBag, Package } from 'lucide-react';
import AdminCharts from '@/app/ui/admin/charts';
// 🔴 Eliminamos la importación de YearSelector aquí, ya no hace falta en la página

export default async function AdminDashboardPage(props: {
  searchParams?: Promise<{ year?: string }>;
}) {
  const searchParams = await props.searchParams;
  
  // 1. DETERMINAR EL AÑO (Mantenemos la lógica de filtrado)
  const currentYear = new Date().getFullYear();
  const selectedYear = Number(searchParams?.year) || currentYear;

  const startDate = new Date(selectedYear, 0, 1); 
  const endDate = new Date(selectedYear + 1, 0, 1); 

  // 2. CONSULTAS
  const [
    userCount, 
    listingCount, 
    openOrdersCount, 
    completedSales, 
    activeListingsByPlatform,
    allConsoles
  ] = await Promise.all([
    prisma.user.count(),

    prisma.listing.count({ where: { status: 'active' } }),
    
    prisma.listing.count({ 
        where: { 
            status: 'sold',
            deliveryStatus: { in: ['pending', 'shipped'] }
        } 
    }),
    
    // GRÁFICA VENTAS (Filtrada por año)
    prisma.listing.findMany({
        where: { 
            status: 'sold',
            deliveryStatus: 'delivered', 
            soldAt: {
                gte: startDate, 
                lt: endDate    
            }
        },
        select: { price: true, soldAt: true }
    }),

    // GRÁFICA PLATAFORMAS
    prisma.listing.groupBy({
        by: ['platformId'],
        where: { status: 'active' },
        _count: { id: true }
    }),

    prisma.console.findMany()
  ]);

  // --- PROCESAMIENTO DE DATOS ---

  // A) Datos Ingresos
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const revenueMap = new Map();
  months.forEach(m => revenueMap.set(m, 0));

  completedSales.forEach(item => {
      if (item.soldAt) {
          const date = new Date(item.soldAt);
          const monthIndex = date.getMonth(); 
          const key = months[monthIndex];
          
          const currentTotal = revenueMap.get(key) || 0;
          revenueMap.set(key, currentTotal + item.price);
      }
  });

  const revenueChartData = Array.from(revenueMap, ([name, total]) => ({ name, total }));

  // B) Datos Plataformas
  const platformChartData = activeListingsByPlatform.map(group => {
      const consoleName = allConsoles.find(c => c.id === group.platformId)?.name || 'Otros';
      return {
          name: consoleName,
          value: group._count.id
      };
  });

  return (
    <main>
      {/* 🟢 CABECERA LIMPIA (Sin selector) */}
      <h1 className="text-3xl font-bold text-dark dark:text-white mb-8">
          Panel de Administración
      </h1>

      {/* KPIs Superiores */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card Usuarios */}
        <div className="rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-sm border border-gray-100 dark:border-neutral-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Usuarios</p>
              <h3 className="text-2xl font-bold text-dark dark:text-white">{userCount}</h3>
            </div>
          </div>
        </div>

        {/* Card Artículos */}
        <div className="rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-sm border border-gray-100 dark:border-neutral-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
                <Package size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Artículos Activos</p>
              <h3 className="text-2xl font-bold text-dark dark:text-white">{listingCount}</h3>
            </div>
          </div>
        </div>

        {/* Card Pedidos */}
        <div className="rounded-xl bg-white dark:bg-neutral-800 p-6 shadow-sm border border-gray-100 dark:border-neutral-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg">
                <ShoppingBag size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Pedidos Abiertos</p>
              <h3 className="text-2xl font-bold text-dark dark:text-white">{openOrdersCount}</h3>
            </div>
          </div>
        </div>
      </div>
      
      {/* GRÁFICAS */}
      <AdminCharts 
        revenueData={revenueChartData} 
        platformData={platformChartData} 
      />

    </main>
  );
}