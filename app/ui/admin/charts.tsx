'use client';

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { formatCurrency } from '@/app/lib/utils';
// 🟢 Importamos el selector AQUÍ (misma carpeta)
import YearSelector from './year-selector';

const PIE_COLORS = ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#ef4444', '#eab308'];

export default function AdminCharts({ 
  revenueData, 
  platformData 
}: { 
  revenueData: any[], 
  platformData: any[] 
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      
      {/* 1. GRÁFICO DE BARRAS: INGRESOS MENSUALES */}
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-700">
        
        {/* 🟢 CABECERA FLEX: Título a la izquierda, Selector a la derecha */}
        <div className="flex flex-row items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-dark dark:text-white">Ingresos Mensuales</h3>
            
            {/* Usamos el selector. Como está dentro de una card blanca/oscura, 
                podemos ajustar un poco clases si quisiéramos, pero el original sirve */}
            <div className="scale-90 origin-right"> {/* Truco visual: un pelín más pequeño para que no robe protagonismo */}
               <YearSelector />
            </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 12 }} 
                tickFormatter={(value) => `€${value}`}
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ 
                  backgroundColor: '#262626', 
                  borderColor: '#404040', 
                  borderRadius: '8px',
                  color: '#fff'
                }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: any) => [formatCurrency(Number(value) * 100), 'Ingresos']}
              />
              <Bar dataKey="total" fill="#f97316" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. GRÁFICO DONUT: STOCK POR PLATAFORMA */}
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-700">
        <h3 className="text-lg font-bold text-dark dark:text-white mb-6">Stock por Plataforma</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={platformData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {platformData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip 
                 contentStyle={{ 
                  backgroundColor: '#262626', 
                  borderColor: '#404040', 
                  borderRadius: '8px',
                  color: '#fff'
                }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ paddingTop: '20px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}