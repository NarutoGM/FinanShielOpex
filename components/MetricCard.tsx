import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, subValue, icon, trend, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    red: "bg-red-50 text-red-700 border-red-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    slate: "bg-slate-50 text-slate-700 border-slate-200",
  };

  const selectedColor = colorClasses[color as keyof typeof colorClasses] || colorClasses.slate;

  return (
    <div className={`p-5 rounded-xl border ${selectedColor} shadow-sm relative overflow-hidden transition-transform hover:-translate-y-1`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          {subValue && <p className="text-sm mt-1 opacity-80">{subValue}</p>}
        </div>
        {icon && <div className="p-2 rounded-lg bg-white/50 backdrop-blur-sm">{icon}</div>}
      </div>
      
      {/* Decoratve Circle */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-current opacity-5 pointer-events-none"></div>
    </div>
  );
};