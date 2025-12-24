import { FinancialData, CalculationResult } from '../types';

export const calculateFinancials = (data: FinancialData): CalculationResult => {
  const { fixedCosts, variableCostPerUnit, sellingPricePerUnit, estimatedSalesUnits } = data;

  // Margen de Contribución Unitario = Precio Venta - Costo Variable Unitario
  const contributionMarginUnit = sellingPricePerUnit - variableCostPerUnit;

  // Ratio del Margen de Contribución = Margen Unitario / Precio Venta
  const contributionMarginRatio = sellingPricePerUnit > 0 
    ? (contributionMarginUnit / sellingPricePerUnit) * 100 
    : 0;

  // Punto de Equilibrio (Unidades) = Costos Fijos / Margen de Contribución Unitario
  const breakEvenUnits = contributionMarginUnit > 0 
    ? Math.ceil(fixedCosts / contributionMarginUnit) 
    : 0;

  // Punto de Equilibrio (Dinero) = Unidades PE * Precio Venta
  const breakEvenRevenue = breakEvenUnits * sellingPricePerUnit;

  // Utilidad Operativa (UAII) = (Ventas Totales - Costos Variables Totales) - Costos Fijos
  const totalRevenue = estimatedSalesUnits * sellingPricePerUnit;
  const totalVariableCosts = estimatedSalesUnits * variableCostPerUnit;
  const operatingIncome = (totalRevenue - totalVariableCosts) - fixedCosts;

  // Grado de Apalancamiento Operativo (GAO/DOL)
  // GAO = Margen de Contribución Total / Utilidad Operativa
  const totalContributionMargin = estimatedSalesUnits * contributionMarginUnit;
  const degreeOfOperatingLeverage = operatingIncome > 0 
    ? totalContributionMargin / operatingIncome 
    : 0;

  // Margen de Seguridad
  const marginOfSafetyUnits = estimatedSalesUnits - breakEvenUnits;
  const marginOfSafety = estimatedSalesUnits > 0 
    ? (marginOfSafetyUnits / estimatedSalesUnits) * 100 
    : 0;

  // Determinación de Nivel de Riesgo (Simplificado basado en Margen de Seguridad y GAO)
  let riskLevel: 'Bajo' | 'Moderado' | 'Alto' | 'Crítico' = 'Moderado';
  
  if (operatingIncome < 0) {
    riskLevel = 'Crítico';
  } else if (marginOfSafety < 10) {
    riskLevel = 'Alto';
  } else if (marginOfSafety < 30) {
    riskLevel = 'Moderado';
  } else {
    riskLevel = 'Bajo';
  }

  return {
    breakEvenUnits,
    breakEvenRevenue,
    contributionMarginUnit,
    contributionMarginRatio,
    operatingIncome,
    degreeOfOperatingLeverage,
    marginOfSafety,
    marginOfSafetyUnits,
    riskLevel
  };
};

export const generateChartData = (data: FinancialData, rangeMultiplier: number = 2) => {
  const { fixedCosts, variableCostPerUnit, sellingPricePerUnit, estimatedSalesUnits } = data;
  const points = [];
  const limit = Math.max(estimatedSalesUnits * rangeMultiplier, 50); // Ensure at least some range
  const step = Math.ceil(limit / 20); // 20 points for the chart

  for (let units = 0; units <= limit; units += step) {
    const totalRevenue = units * sellingPricePerUnit;
    const totalVariableCost = units * variableCostPerUnit;
    const totalCost = fixedCosts + totalVariableCost;
    
    points.push({
      units,
      ingresos: totalRevenue,
      costosTotales: totalCost,
      costosFijos: fixedCosts,
      utilidad: totalRevenue - totalCost
    });
  }
  return points;
};

export const getMockRecommendations = (res: CalculationResult): any[] => {
  const recs = [];

  if (res.operatingIncome <= 0) {
    recs.push({
      title: "Pérdida Operativa Detectada",
      description: "La empresa no está cubriendo sus costos totales. Se recomienda urgentemente reducir costos fijos o aumentar el volumen de ventas.",
      type: "danger"
    });
  }

  if (res.marginOfSafety < 15 && res.operatingIncome > 0) {
    recs.push({
      title: "Margen de Seguridad Bajo",
      description: `El margen de seguridad es solo del ${res.marginOfSafety.toFixed(1)}%. Una pequeña caída en las ventas podría llevar a pérdidas.`,
      type: "warning"
    });
  }

  if (res.degreeOfOperatingLeverage > 3) {
    recs.push({
      title: "Alto Apalancamiento Operativo",
      description: `Su GAO es de ${res.degreeOfOperatingLeverage.toFixed(2)}. Esto indica altos costos fijos. Las utilidades son muy sensibles a cambios en las ventas (alto riesgo, alta recompensa).`,
      type: "info"
    });
  }

  if (res.riskLevel === 'Bajo') {
    recs.push({
      title: "Salud Financiera Estable",
      description: "La empresa opera con un buen margen de seguridad. Considere reinvertir utilidades para crecimiento.",
      type: "success"
    });
  }

  return recs;
};