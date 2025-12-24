export interface FinancialData {
  fixedCosts: number;
  variableCostPerUnit: number;
  sellingPricePerUnit: number;
  estimatedSalesUnits: number;
}

export interface CalculationResult {
  breakEvenUnits: number;
  breakEvenRevenue: number;
  contributionMarginUnit: number;
  contributionMarginRatio: number; // %
  operatingIncome: number; // UAII
  degreeOfOperatingLeverage: number; // GAO/DOL
  marginOfSafety: number; // %
  marginOfSafetyUnits: number;
  riskLevel: 'Bajo' | 'Moderado' | 'Alto' | 'Crítico';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  lastModified: number;
}

export interface SimulationScenario {
  id: string;
  projectId: string; // Link to parent
  name: string;
  description: string;
  data: FinancialData;
  lastModified: number;
}

export enum ViewState {
  LOGIN,
  PROJECT_LIST,   // Level 1: List of Parents
  PROJECT_DETAILS,// Level 2: List of Scenarios inside a Parent
  SCENARIO_EDITOR // Level 3: The actual simulator
}

export interface Recommendation {
  title: string;
  description: string;
  type: 'success' | 'warning' | 'danger' | 'info';
}