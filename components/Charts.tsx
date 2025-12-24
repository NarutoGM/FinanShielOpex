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
import { CalculationResult } from '@/types';

interface BreakEvenChartProps {
  data: any[];
  breakEvenPoint: { x: number, y: number };
}

export const BreakEvenChart: React.FC<BreakEvenChartProps> = ({ data, breakEvenPoint }) => {
  return (
    <div className="w-full h-[350px] bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Gráfico Punto de Equilibrio</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="units" 
            label={{ value: 'Unidades Vendidas', position: 'insideBottomRight', offset: -10 }} 
            tick={{fontSize: 12}}
          />
          <YAxis 
            label={{ value: 'Monto ($)', angle: -90, position: 'insideLeft' }} 
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
  );
};

interface ProfitChartProps {
    data: any[];
}

export const ProfitChart: React.FC<ProfitChartProps> = ({ data }) => {
    return (
      <div className="w-full h-[350px] bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Zona de Utilidad vs Pérdida</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
            <XAxis dataKey="units" />
            <YAxis tickFormatter={(val) => `${val/1000}k`} />
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
    );
};