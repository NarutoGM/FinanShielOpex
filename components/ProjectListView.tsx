import React from 'react';
import { Project, SimulationScenario } from '@/types';

interface ProjectListViewProps {
  projects: Project[];
  scenarios: SimulationScenario[];
  onSelectProject: (id: string) => void;
  onCreateProject: () => void;
  onDeleteProject: (e: React.MouseEvent, id: string) => void;
}

export const ProjectListView: React.FC<ProjectListViewProps> = ({ 
  projects, 
  scenarios, 
  onSelectProject, 
  onCreateProject, 
  onDeleteProject 
}) => {
  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Cartera de Proyectos</h2>
          <p className="text-slate-500 mt-1">Selecciona un proyecto padre para ver sus estimaciones.</p>
        </div>
        <button 
          onClick={onCreateProject} 
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          <span>Nuevo Proyecto</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project) => {
          const childCount = scenarios.filter(s => s.projectId === project.id).length;
          return (
            <div 
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className="bg-white rounded-xl border border-slate-200 p-6 cursor-pointer hover:shadow-lg hover:border-indigo-400 transition-all group relative"
            >
               <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                  onClick={(e) => onDeleteProject(e, project.id)} 
                  className="text-slate-300 hover:text-red-500 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors" 
                  title="Eliminar proyecto"
                 >
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                 </button>
              </div>

              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <div>
                  <span className="text-xs font-bold text-indigo-500 uppercase tracking-wide">{project.category}</span>
                  <h3 className="text-xl font-bold text-slate-800">{project.name}</h3>
                </div>
              </div>
              <p className="text-slate-500 mb-6">{project.description}</p>
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  {childCount} {childCount === 1 ? 'Estimación' : 'Estimaciones'}
                </span>
                <span className="text-xs text-slate-400">Modificado: {new Date(project.lastModified).toLocaleDateString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};