"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FinancialData, ViewState, SimulationScenario, Project } from "@/types";
import { ProjectListView } from "@/components/ProjectListView";
import { ProjectDetailsView } from "@/components/ProjectDetailsView";
import { ScenarioEditor } from "@/components/ScenarioEditor";
import ConceptosGenerales from "@/components/ConceptosGenerales";
import {
  INITIAL_TEMPLATE,
  MOCK_PROJECTS,
  MOCK_SCENARIOS,
} from "@/data/mockData";

function App() {
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");

  // Navigation State
  const [view, setView] = useState<ViewState>(ViewState.PROJECT_LIST);
  const [showConceptos, setShowConceptos] = useState(false);

  useEffect(() => {
    if (viewParam === "conceptos") {
      setShowConceptos(true);
      setView(ViewState.PROJECT_LIST);
    } else {
      setShowConceptos(false);
    }
  }, [viewParam]);

  // Data State
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [scenarios, setScenarios] =
    useState<SimulationScenario[]>(MOCK_SCENARIOS);

  // Context State
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  // --- Helpers ---
  const activeProject = projects.find((p) => p.id === activeProjectId);
  const activeScenario = scenarios.find((s) => s.id === activeScenarioId);
  const filteredScenarios = scenarios.filter(
    (s) => s.projectId === activeProjectId
  );

  // --- Project CRUD ---
  const handleProjectUpdate = (field: keyof Project, value: string) => {
    if (!activeProjectId) return;
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProjectId
          ? { ...p, [field]: value, lastModified: Date.now() }
          : p
      )
    );
  };

  const createNewProject = () => {
    const newId = `p${Date.now()}`;
    const newProject: Project = {
      id: newId,
      name: "Nuevo Negocio",
      description: "Describe de qué trata este proyecto...",
      category: "General",
      lastModified: Date.now(),
    };
    setProjects([newProject, ...projects]);
    setActiveProjectId(newId);
    setView(ViewState.PROJECT_DETAILS);
  };

  const deleteProject = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (
      window.confirm(
        "¿Estás seguro de eliminar el proyecto entero y todas sus estimaciones?"
      )
    ) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setScenarios((prev) => prev.filter((s) => s.projectId !== id));
    }
  };

  // --- Scenario CRUD ---
  const createNewScenario = () => {
    if (!activeProjectId) return;

    const newId = `s${Date.now()}`;
    const hasBase = filteredScenarios.length > 0;
    const baseData = hasBase ? filteredScenarios[0].data : INITIAL_TEMPLATE;

    const newScenario: SimulationScenario = {
      id: newId,
      projectId: activeProjectId,
      name: hasBase
        ? `Estimación #${filteredScenarios.length + 1}`
        : "Escenario Base",
      description: hasBase
        ? "Variación basada en la situación actual."
        : "Punto de partida inicial.",
      lastModified: Date.now(),
      data: { ...baseData },
    };

    setScenarios([...scenarios, newScenario]);
    setActiveScenarioId(newId);
    setView(ViewState.SCENARIO_EDITOR);
  };

  const openScenario = (scenario: SimulationScenario) => {
    setActiveScenarioId(scenario.id);
    setView(ViewState.SCENARIO_EDITOR);
  };

  const saveScenario = (
    name: string,
    description: string,
    data: FinancialData
  ) => {
    if (!activeScenarioId) return;

    setScenarios((prev) =>
      prev.map((s) =>
        s.id === activeScenarioId
          ? { ...s, name, description, data, lastModified: Date.now() }
          : s
      )
    );

    alert("Simulación guardada correctamente");
  };

  const deleteScenario = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("¿Eliminar esta estimación permanentemente?")) {
      setScenarios((prev) => prev.filter((s) => s.id !== id));
    }
  };

  // --- Main Layout ---
  return (
    <div className="flex min-h-screen ">
      <main className="flex-1 p-8 overflow-y-auto">
        {showConceptos ? (
          <ConceptosGenerales />
        ) : view === ViewState.PROJECT_LIST ? (
          <ProjectListView
            projects={projects}
            scenarios={scenarios}
            onSelectProject={(id) => {
              setActiveProjectId(id);
              setView(ViewState.PROJECT_DETAILS);
            }}
            onCreateProject={createNewProject}
            onDeleteProject={deleteProject}
          />
        ) : null}

        {view === ViewState.PROJECT_DETAILS && activeProject && (
          <ProjectDetailsView
            project={activeProject}
            scenarios={filteredScenarios}
            onUpdateProject={handleProjectUpdate}
            onBack={() => setView(ViewState.PROJECT_LIST)}
            onCreateScenario={createNewScenario}
            onOpenScenario={openScenario}
            onDeleteScenario={deleteScenario}
          />
        )}

        {view === ViewState.SCENARIO_EDITOR && activeScenario && (
          <ScenarioEditor
            key={activeScenario.id}
            initialData={activeScenario.data}
            initialName={activeScenario.name}
            initialDescription={activeScenario.description}
            onSave={saveScenario}
            onBack={() => setView(ViewState.PROJECT_DETAILS)}
          />
        )}
      </main>
    </div>
  );
}

export default App;
