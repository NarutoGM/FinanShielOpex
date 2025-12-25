import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot,
  AreaChart,
  Area
} from 'recharts';

interface BreakEvenChartProps {
  data: any[];
  breakEvenPoint: { x: number, y: number };
}

export const BreakEvenChart: React.FC<BreakEvenChartProps> = ({ data, breakEvenPoint }) => {
  return (
    <div className="w-full h-[350px] bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
      <h3 className="text-lg font-semibold text-slate-800 mb-2">Gráfico Punto de Equilibrio</h3>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="units"
              // Agregamos tickCount para forzar más divisiones en horizontal
              tickCount={10}
              height={50}
              label={{ value: 'Unidades Vendidas', position: 'insideBottom', offset: -10 }} 
              tick={{fontSize: 12}}
            />
            <YAxis 
              // Agregamos tickCount para que salgan más valores verticales (ej: 0, 2k, 4k, 6k...)
              tickCount={10}
              width={50}
              label={{ value: 'Monto ($)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }} 
              tickFormatter={(value) => `${value/1000}k`}
              tick={{fontSize: 12}}
            />
            <Tooltip 
              formatter={(value: number | undefined) => [`$${value?.toLocaleString() || 0}`, '']}
              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
            <Legend verticalAlign="top" height={36}/>
            <Line 
              type="monotone" 
              dataKey="ingresos" 
              stroke="#10b981" 
              strokeWidth={3} 
              name="Ingresos Totales" 
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="costosTotales" 
              stroke="#ef4444" 
              strokeWidth={3} 
              name="Costos Totales" 
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="costosFijos" 
              stroke="#64748b" 
              strokeDasharray="5 5" 
              name="Costos Fijos" 
              dot={false}
            />
            {breakEvenPoint.x > 0 && (
              <ReferenceDot 
                x={breakEvenPoint.x} 
                y={breakEvenPoint.y} 
                r={6} 
                fill="#f59e0b" 
                stroke="#fff"
                strokeWidth={2}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

interface ProfitChartProps {
    data: any[];
}

export const ProfitChart: React.FC<ProfitChartProps> = ({ data }) => {
    return (
      <div className="w-full h-[350px] bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Zona de Utilidad vs Pérdida</h3>
        
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <defs>
                <linearGradient id="colorUtilidad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPerdida" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="units" 
                // Forzamos más valores aquí también
                tickCount={10}
                height={30} 
                tick={{fontSize: 12}} 
              />
              <YAxis 
                // Forzamos más valores aquí también
                tickCount={10}
                width={50} 
                tickFormatter={(val) => `${val/1000}k`} 
                tick={{fontSize: 12}} 
              />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <ReferenceDot y={0} stroke="black" strokeDasharray="3 3"/>
              <Area 
                  type="monotone" 
                  dataKey="utilidad" 
                  stroke="#6366f1" 
                  fillOpacity={1} 
                  fill="url(#colorUtilidad)" 
                  name="Utilidad/Pérdida Neta"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
};