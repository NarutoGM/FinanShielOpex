import React from 'react';
import { Project, SimulationScenario } from '@/types';
import { calculateFinancials } from '@/services/financialLogic';

interface ProjectDetailsViewProps {
  project: Project;
  scenarios: SimulationScenario[];
  onUpdateProject: (field: keyof Project, value: string) => void;
  onBack: () => void;
  onCreateScenario: () => void;
  onOpenScenario: (scenario: SimulationScenario) => void;
  onDeleteScenario: (e: React.MouseEvent, id: string) => void;
}

export const ProjectDetailsView: React.FC<ProjectDetailsViewProps> = ({
  project,
  scenarios,
  onUpdateProject,
  onBack,
  onCreateScenario,
  onOpenScenario,
  onDeleteScenario
}) => {
  // Logic to separate base vs variations
  const baseScenario = scenarios.length > 0 ? scenarios[0] : null;
  const variationScenarios = scenarios.length > 1 ? scenarios.slice(1) : [];

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-slate-500 mb-6">
        <button onClick={onBack} className="hover:text-indigo-600 hover:underline">Cartera</button>
        <span>/</span>
        <span className="text-slate-800 font-semibold">{project.name}</span>
      </div>

      {/* Editable Project Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nombre del Proyecto</label>
            <input 
                type="text" 
                value={project.name}
                onChange={(e) => onUpdateProject('name', e.target.value)}
                className="text-3xl font-bold text-slate-800 w-full border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none bg-transparent transition-colors mb-4"
            />
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Descripción</label>
            <textarea 
                value={project.description}
                onChange={(e) => onUpdateProject('description', e.target.value)}
                className="w-full text-slate-600 resize-none h-20 border border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none bg-transparent rounded p-2 transition-colors"
            />
          </div>
          <div className="flex flex-col justify-center items-end border-l border-slate-100 pl-6">
              <button 
                onClick={onCreateScenario}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-all shadow-md mb-3"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                <span>Agregar Estimación</span>
              </button>
              <p className="text-xs text-slate-400 text-center max-w-[200px]">
                {baseScenario ? 'Crea una variación basada en el Escenario Base.' : 'Crea el Escenario Base inicial.'}
              </p>
          </div>
        </div>
      </div>

      {/* === ZONA 1: ESCENARIO BASE (EL PADRE) === */}
      {baseScenario && (
        <div className="mb-12">
           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
             <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
             Situación Actual / Base
           </h3>
           
           {(() => {
              const res = calculateFinancials(baseScenario.data);
              return (
                <div 
                  onClick={() => onOpenScenario(baseScenario)}
                  className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-300 p-8 cursor-pointer hover:shadow-xl hover:border-indigo-500 transition-all group relative overflow-hidden"
                >
                   <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
                   
                   <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button 
                        onClick={(e) => onDeleteScenario(e, baseScenario.id)} 
                        className="text-slate-400 hover:text-red-500 p-2 bg-white shadow-sm border border-slate-100 rounded-full hover:bg-red-50" 
                        title="Eliminar escenario base"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                   </div>

                   <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                              res.riskLevel === 'Crítico' ? 'bg-red-100 text-red-700 border-red-200' :
                              res.riskLevel === 'Alto' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                              res.riskLevel === 'Moderado' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                              'bg-emerald-100 text-emerald-700 border-emerald-200'
                            }`}>
                              Riesgo {res.riskLevel}
                          </span>
                          <span className="text-xs text-slate-400">Modificado: {new Date(baseScenario.lastModified).toLocaleDateString()}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">{baseScenario.name}</h2>
                        <p className="text-slate-500 max-w-2xl">{baseScenario.description}</p>
                      </div>

                      <div className="flex items-center gap-8 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-8">
                         <div className="text-center">
                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Utilidad Operativa</p>
                            <p className={`text-2xl font-bold ${res.operatingIncome >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              ${res.operatingIncome.toLocaleString()}
                            </p>
                         </div>
                         <div className="text-center hidden sm:block">
                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Punto Equilibrio</p>
                            <p className="text-2xl font-bold text-slate-700">{res.breakEvenUnits} u.</p>
                         </div>
                         <div className="text-center hidden sm:block">
                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Margen Seguridad</p>
                            <p className="text-2xl font-bold text-blue-600">{res.marginOfSafety.toFixed(1)}%</p>
                         </div>
                      </div>
                   </div>
                </div>
              );
           })()}
        </div>
      )}

      {/* === ZONA 2: VARIACIONES (LOS HIJOS) === */}
      {variationScenarios.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
             <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
             Simulaciones y Variaciones ({variationScenarios.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {variationScenarios.map((scenario) => {
              const res = calculateFinancials(scenario.data);
              return (
                <div 
                  key={scenario.id}
                  onClick={() => onOpenScenario(scenario)}
                  className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:shadow-lg hover:border-indigo-400 transition-all group relative overflow-hidden"
                >
                   <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                     <button 
                      onClick={(e) => onDeleteScenario(e, scenario.id)} 
                      className="text-slate-400 hover:text-red-500 p-1 bg-white shadow-sm border border-slate-100 rounded hover:bg-red-50" 
                      title="Eliminar estimación"
                     >
                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                     </button>
                  </div>

                  <div className="flex justify-between items-start mb-3">
                     <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      res.riskLevel === 'Crítico' ? 'bg-red-50 text-red-600 border-red-200' :
                      res.riskLevel === 'Alto' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                      res.riskLevel === 'Moderado' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                      'bg-emerald-50 text-emerald-600 border-emerald-200'
                    }`}>
                      {res.riskLevel}
                    </span>
                  </div>

                  <h4 className="font-bold text-lg text-slate-800 leading-tight mb-1">{scenario.name}</h4>
                  <p className="text-xs text-slate-500 mb-4 h-8 overflow-hidden line-clamp-2">{scenario.description}</p>
                  
                  <div className="bg-slate-50 rounded-lg p-3 space-y-2 border border-slate-100">
                     <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Utilidad:</span>
                        <span className={`font-bold ${res.operatingIncome >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>${res.operatingIncome.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Punto Eq:</span>
                        <span className="font-bold text-slate-700">{res.breakEvenUnits} u.</span>
                     </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {scenarios.length === 0 && (
        <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 mt-8">
          <p className="text-slate-400 font-medium">No hay estimaciones creadas para este proyecto.</p>
          <button onClick={onCreateScenario} className="text-indigo-500 text-sm mt-2 hover:underline">Crear el Escenario Base ahora</button>
        </div>
      )}
    </div>
  );
};