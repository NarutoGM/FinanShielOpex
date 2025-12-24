import React, { useState, useEffect } from 'react';
import { FinancialData, CalculationResult } from '@/types';
import { calculateFinancials, generateChartData } from '../services/financialLogic';
import { MetricCard } from './MetricCard';
import { BreakEvenChart, ProfitChart } from './Charts';

interface ScenarioEditorProps {
  initialData: FinancialData;
  initialName: string;
  initialDescription: string;
  onSave: (name: string, description: string, data: FinancialData) => void;
  onBack: () => void;
}

export const ScenarioEditor: React.FC<ScenarioEditorProps> = ({
  initialData,
  initialName,
  initialDescription,
  onSave,
  onBack
}) => {
  const [editorData, setEditorData] = useState<FinancialData>(initialData);
  const [editorName, setEditorName] = useState(initialName);
  const [editorDescription, setEditorDescription] = useState(initialDescription);
  
  const [editorResults, setEditorResults] = useState<CalculationResult | null>(null);
  const [editorChartData, setEditorChartData] = useState<any[]>([]);

  useEffect(() => {
    const res = calculateFinancials(editorData);
    setEditorResults(res);
    const charts = generateChartData(editorData);
    setEditorChartData(charts);
  }, [editorData]);

  const handleEditorChange = (field: keyof FinancialData, value: string) => {
    const numValue = parseFloat(value) || 0;
    setEditorData(prev => ({ ...prev, [field]: numValue }));
  };

  const handleSave = () => {
    onSave(editorName, editorDescription, editorData);
  };

  if (!editorResults) return null;

  return (
    <div className="animate-fade-in flex flex-col h-[calc(100vh-100px)]">
       {/* Header */}
       <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 bg-white/50 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center space-x-4 flex-1">
            <button 
              onClick={onBack}
              className="flex items-center space-x-1 text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              <span className="text-sm font-medium">Volver</span>
            </button>
            <div className="h-6 w-px bg-slate-300 mx-2"></div>
            <div className="flex-1 max-w-xl">
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Nombre de la Estimación</label>
              <input 
                type="text" 
                value={editorName}
                onChange={(e) => setEditorName(e.target.value)}
                className="w-full text-xl font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none transition-colors placeholder-slate-300"
                placeholder="Nombre del escenario..."
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  editorResults.riskLevel === 'Crítico' ? 'bg-red-100 text-red-800 border-red-200' :
                  editorResults.riskLevel === 'Alto' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                  editorResults.riskLevel === 'Moderado' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                  'bg-emerald-100 text-emerald-800 border-emerald-200'
            }`}>
                Riesgo: {editorResults.riskLevel}
            </div>
            <button 
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-sm transition-all flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
              <span>Guardar Cambios</span>
            </button>
          </div>
       </div>

       {/* Split View */}
       <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
          {/* Controls */}
          <div className="w-full lg:w-1/3 bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-y-auto custom-scrollbar">
            
            {/* Description Edit */}
            <div className="mb-6 pb-6 border-b border-slate-100">
              <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Descripción del Escenario</label>
              <textarea 
                value={editorDescription}
                onChange={(e) => setEditorDescription(e.target.value)}
                className="w-full text-sm text-slate-600 border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-16 bg-slate-50"
                placeholder="Describe las hipótesis de este escenario..."
              />
            </div>

            <h3 className="font-bold text-slate-800 mb-6 flex items-center text-sm uppercase tracking-wide">
              Variables de la Estimación
            </h3>
            
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 transition-colors hover:border-indigo-200">
                <div className="flex justify-between mb-2 items-center">
                  <label className="text-xs font-bold text-slate-600 uppercase">Precio Venta ($)</label>
                  <input type="number" value={editorData.sellingPricePerUnit} onChange={(e) => handleEditorChange('sellingPricePerUnit', e.target.value)} className="w-20 text-right px-2 py-1 rounded border border-slate-300 text-zinc-800 text-sm font-mono focus:border-indigo-500 outline-none" />
                </div>
                <input type="range" min="1" max="1000" step="1" value={editorData.sellingPricePerUnit} onChange={(e) => handleEditorChange('sellingPricePerUnit', e.target.value)} className="w-full h-1.5 bg-slate-200 text-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 transition-colors hover:border-blue-200">
                <div className="flex justify-between mb-2 items-center">
                  <label className="text-xs font-bold text-slate-600 uppercase">Costos Fijos ($)</label>
                  <input type="number" value={editorData.fixedCosts} onChange={(e) => handleEditorChange('fixedCosts', e.target.value)} className="w-24 text-right px-2 py-1 rounded border border-slate-300 text-sm font-mono text-zinc-800 focus:border-blue-500 outline-none" />
                </div>
                <input type="range" min="1000" max="100000" step="100" value={editorData.fixedCosts} onChange={(e) => handleEditorChange('fixedCosts', e.target.value)} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none text-zinc-800 cursor-pointer accent-blue-500" />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 transition-colors hover:border-red-200">
                <div className="flex justify-between mb-2 items-center">
                  <label className="text-xs font-bold text-slate-600 uppercase">Costo Variable ($)</label>
                  <input type="number" value={editorData.variableCostPerUnit} onChange={(e) => handleEditorChange('variableCostPerUnit', e.target.value)} className="w-20 text-right px-2 py-1 rounded border border-slate-300 text-sm text-zinc-800 font-mono focus:border-red-500 outline-none" />
                </div>
                <input type="range" min="1" max={editorData.sellingPricePerUnit - 1 || 100} step="1" value={editorData.variableCostPerUnit} onChange={(e) => handleEditorChange('variableCostPerUnit', e.target.value)} className="w-full h-1.5 text-zinc-800 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-500" />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 transition-colors hover:border-emerald-200">
                <div className="flex justify-between mb-2 items-center">
                  <label className="text-xs font-bold text-slate-600 uppercase">Ventas (Unds)</label>
                  <input type="number" value={editorData.estimatedSalesUnits} onChange={(e) => handleEditorChange('estimatedSalesUnits', e.target.value)} className="w-20 text-right px-2 py-1 rounded border border-slate-300 text-sm font-mono text-zinc-800 focus:border-emerald-500 outline-none" />
                </div>
                <input type="range" min="10" max="5000" step="10" value={editorData.estimatedSalesUnits} onChange={(e) => handleEditorChange('estimatedSalesUnits', e.target.value)} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none text-zinc-800 cursor-pointer accent-emerald-500" />
              </div>
            </div>
          </div>

          {/* Visuals */}
          <div className="w-full lg:w-2/3 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2 pb-6">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard title="Utilidad" value={`$${editorResults.operatingIncome.toLocaleString()}`} color={editorResults.operatingIncome >= 0 ? "green" : "red"} />
                <MetricCard title="Punto Eq." value={editorResults.breakEvenUnits} subValue="Unidades" color="blue" />
                <MetricCard title="GAO" value={editorResults.degreeOfOperatingLeverage.toFixed(2)} color="orange" />
                <MetricCard title="Margen Seg." value={`${editorResults.marginOfSafety.toFixed(1)}%`} color={editorResults.marginOfSafety < 20 ? "red" : "green"} />
             </div>
             <BreakEvenChart data={editorChartData} breakEvenPoint={{ x: editorResults.breakEvenUnits, y: editorResults.breakEvenRevenue }} />
             <ProfitChart data={editorChartData} />
          </div>
       </div>
    </div>
  );
};