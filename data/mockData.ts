import { FinancialData, Project, SimulationScenario } from '../types';

export const INITIAL_TEMPLATE: FinancialData = {
  fixedCosts: 5000,
  variableCostPerUnit: 20,
  sellingPricePerUnit: 50,
  estimatedSalesUnits: 200,
};

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Tienda de Zapatillas',
    description: 'Análisis de ventas para el local del centro comercial.',
    category: 'Comercio',
    lastModified: Date.now()
  },
  {
    id: 'p2',
    name: 'Nueva Cafetería',
    description: 'Evaluación de costos para abrir una sucursal nueva.',
    category: 'Restaurante',
    lastModified: Date.now() - 86400000
  },
  {
    id: 'p3',
    name: 'Fábrica de Muebles',
    description: 'Decisiones sobre maquinaria y personal de planta.',
    category: 'Manufactura',
    lastModified: Date.now() - 172800000
  }
];

export const MOCK_SCENARIOS: SimulationScenario[] = [
  // Children of Project 1 (Zapatillas)
  {
    id: 's1', projectId: 'p1',
    name: 'Situación Actual (Base)',
    description: 'Ventas normales del mes pasado.',
    lastModified: Date.now(),
    data: { fixedCosts: 3000, variableCostPerUnit: 40, sellingPricePerUnit: 90, estimatedSalesUnits: 100 }
  },
  {
    id: 's2', projectId: 'p1',
    name: 'Vender 20% más unidades',
    description: 'Si hacemos publicidad y logramos atraer más clientes.',
    lastModified: Date.now(),
    data: { fixedCosts: 3200, variableCostPerUnit: 40, sellingPricePerUnit: 90, estimatedSalesUnits: 120 }
  },
  {
    id: 's3', projectId: 'p1',
    name: 'Subir Precio a $110',
    description: 'Vender más caro, aunque perdamos algunos clientes (80 ventas).',
    lastModified: Date.now(),
    data: { fixedCosts: 3000, variableCostPerUnit: 40, sellingPricePerUnit: 110, estimatedSalesUnits: 80 }
  },
   {
    id: 's4', projectId: 'p1',
    name: 'Contratar otro vendedor',
    description: 'Aumenta el costo fijo (sueldo), pero esperamos vender 140 unidades.',
    lastModified: Date.now(),
    data: { fixedCosts: 4500, variableCostPerUnit: 40, sellingPricePerUnit: 90, estimatedSalesUnits: 140 }
  },

  // Children of Project 2 (Cafetería)
  {
    id: 's5', projectId: 'p2',
    name: 'Local Pequeño (Base)',
    description: 'Alquiler barato y pocos empleados.',
    lastModified: Date.now(),
    data: { fixedCosts: 2000, variableCostPerUnit: 2, sellingPricePerUnit: 5, estimatedSalesUnits: 800 }
  },
  {
    id: 's6', projectId: 'p2',
    name: 'Comprar Máquina de Café Pro',
    description: 'Sube el costo mensual por el préstamo, pero vendemos el café más caro.',
    lastModified: Date.now(),
    data: { fixedCosts: 2800, variableCostPerUnit: 2, sellingPricePerUnit: 6.5, estimatedSalesUnits: 850 }
  },
  {
    id: 's7', projectId: 'p2',
    name: 'Local Grande en la Avenida',
    description: 'Alquiler mucho más caro, pero esperamos el triple de clientes.',
    lastModified: Date.now(),
    data: { fixedCosts: 6000, variableCostPerUnit: 2, sellingPricePerUnit: 5, estimatedSalesUnits: 2000 }
  },

  // Children of Project 3 (Muebles)
  {
    id: 's8', projectId: 'p3',
    name: 'Trabajo Artesanal',
    description: 'Hacer todo a mano. Costo fijo bajo, pero tardamos mucho (pocas ventas).',
    lastModified: Date.now(),
    data: { fixedCosts: 1500, variableCostPerUnit: 100, sellingPricePerUnit: 300, estimatedSalesUnits: 15 }
  },
  {
    id: 's9', projectId: 'p3',
    name: 'Adquirir Maquinaria Industrial',
    description: 'Invertir en máquinas. Sube el costo fijo mucho, pero producimos rápido.',
    lastModified: Date.now(),
    data: { fixedCosts: 5000, variableCostPerUnit: 60, sellingPricePerUnit: 300, estimatedSalesUnits: 50 }
  }
];