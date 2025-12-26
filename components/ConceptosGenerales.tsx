"use client";

import { useState, useEffect } from "react";

export default function ConceptosGenerales() {
  // Estados para los inputs del dashboard
  const [cf, setCf] = useState<number>(10000); // Costos Fijos
  const [cvu, setCvu] = useState<number>(50); // Costo Variable Unitario
  const [pvu, setPvu] = useState<number>(100); // Precio de Venta Unitario
  const [q, setQ] = useState<number>(500); // Cantidad Vendida
  const [capacidadMaxima] = useState<number>(1000); // Capacidad máxima estimada

  // Estados para los resultados calculados
  const [mcu, setMcu] = useState<number>(0); // Margen de Contribución Unitario
  const [beu, setBeu] = useState<number>(0); // Break-even en Unidades
  const [ber, setBer] = useState<number>(0); // Break-even en Ingresos
  const [gao, setGao] = useState<number | null>(null); // Grado de Apalancamiento Operativo
  const [iro, setIro] = useState<number>(0); // Índice de Riesgo Operativo
  const [utilidad, setUtilidad] = useState<number>(0); // Utilidad

  // Estados para alertas
  const [alertas, setAlertas] = useState<string[]>([]);

  // Función para calcular métricas
  const calcularMetricas = () => {
    const nuevasAlertas: string[] = [];

    // 1. Margen de Contribución Unitario
    const mcuCalc = pvu - cvu;
    setMcu(mcuCalc);

    // Alerta de margen de contribución negativo
    if (mcuCalc <= 0) {
      nuevasAlertas.push(
        "❌ Margen de contribución negativo. Estás vendiendo por debajo del costo variable. Revisa tu precio de venta."
      );
    }

    // 2. Punto de Equilibrio en Unidades
    let beuCalc = 0;
    if (mcuCalc > 0) {
      beuCalc = cf / mcuCalc;
    }
    setBeu(beuCalc);

    // 3. Punto de Equilibrio en Ingresos
    const berCalc = beuCalc * pvu;
    setBer(berCalc);

    // Alerta de punto de equilibrio alto
    if (capacidadMaxima > 0 && beuCalc > capacidadMaxima * 0.5) {
      nuevasAlertas.push(
        "⚠️ Tu punto de equilibrio es alto. Considera reducir costos fijos o aumentar el precio de venta."
      );
    }

    // 4. Grado de Apalancamiento Operativo
    const denominadorGAO = q * mcuCalc - cf;
    let gaoCalc: number | null = null;

    if (denominadorGAO > 0 && mcuCalc > 0) {
      gaoCalc = (q * mcuCalc) / denominadorGAO;
    } else if (denominadorGAO <= 0) {
      nuevasAlertas.push(
        "⚠️ No se puede calcular el GAO: las ventas actuales no superan los costos fijos."
      );
    }
    setGao(gaoCalc);

    // 5. Índice de Riesgo Operativo
    let iroCalc = 0;
    const denominadorIRO = cf + q * mcuCalc;
    if (denominadorIRO > 0) {
      iroCalc = cf / denominadorIRO;
    }
    setIro(iroCalc);

    // Alerta de riesgo operativo alto
    if (iroCalc > 0.6) {
      nuevasAlertas.push(
        "🚨 Alto riesgo operativo. Pequeños cambios en ventas o costos pueden afectar significativamente tu rentabilidad."
      );
    }

    // 6. Utilidad
    const utilidadCalc = q * mcuCalc - cf;
    setUtilidad(utilidadCalc);

    setAlertas(nuevasAlertas);
  };

  // Efecto para calcular todas las métricas cuando cambian los inputs
  useEffect(() => {
    calcularMetricas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cf, cvu, pvu, q]);

  // Función para determinar el color del riesgo
  const getRiesgoColor = (iro: number): string => {
    if (iro < 0.3) return "bg-green-100 text-green-800 border-green-300";
    if (iro < 0.6) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  const getRiesgoTexto = (iro: number): string => {
    if (iro < 0.3) return "Bajo Riesgo";
    if (iro < 0.6) return "Riesgo Medio";
    return "Alto Riesgo";
  };

  const getRiesgoExplicacion = (iro: number): string => {
    if (iro < 0.3) {
      return "Los costos fijos representan una proporción baja de la estructura de costos total, lo que reduce la vulnerabilidad ante cambios en las ventas.";
    }
    if (iro < 0.6) {
      return "Los costos fijos tienen un peso moderado en la estructura de costos. Se recomienda monitorear las ventas y evaluar estrategias para optimizar costos.";
    }
    return "Los costos fijos representan una proporción alta de la estructura de costos, incrementando significativamente la vulnerabilidad ante disminuciones en las ventas.";
  };

  // Función para formatear números con separadores de miles
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  // Función para generar PDF
  const generarPDF = async () => {
    try {
      // Importar jsPDF dinámicamente
      const jsPDFModule = await import("jspdf");
      const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;

      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPosition = 20;

      // Encabezado
      doc.setFontSize(20);
      doc.setTextColor(37, 99, 235);
      doc.text("FinanShield OPEX", pageWidth / 2, yPosition, {
        align: "center",
      });
      yPosition += 8;

      doc.setFontSize(14);
      doc.setTextColor(75, 85, 99);
      doc.text("Análisis del Punto de Equilibrio", pageWidth / 2, yPosition, {
        align: "center",
      });
      yPosition += 10;

      // Información
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text(
        `Fecha: ${new Date().toLocaleDateString("es-ES")}`,
        20,
        yPosition
      );
      yPosition += 10;

      // Línea separadora
      doc.setDrawColor(229, 231, 235);
      doc.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 8;

      // Datos de entrada
      doc.setFontSize(14);
      doc.setTextColor(31, 41, 55);
      doc.text("DATOS DE ENTRADA", 20, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81);
      doc.text(`Costos Fijos (CF): $${formatNumber(cf)}`, 25, yPosition);
      yPosition += 6;
      doc.text(
        `Costo Variable Unitario (CVU): $${formatNumber(cvu)}`,
        25,
        yPosition
      );
      yPosition += 6;
      doc.text(
        `Precio de Venta Unitario (PVU): $${formatNumber(pvu)}`,
        25,
        yPosition
      );
      yPosition += 6;
      doc.text(
        `Cantidad Vendida (Q): ${formatNumber(q)} unidades`,
        25,
        yPosition
      );
      yPosition += 10;

      // Resultados calculados
      doc.setFontSize(14);
      doc.setTextColor(31, 41, 55);
      doc.text("RESULTADOS CALCULADOS", 20, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81);
      doc.text(
        `Margen de Contribución (MCU): $${formatNumber(mcu)}`,
        25,
        yPosition
      );
      yPosition += 6;
      doc.text(
        `Punto de Equilibrio (BEU): ${formatNumber(beu)} unidades`,
        25,
        yPosition
      );
      yPosition += 6;
      doc.text(
        `Punto de Equilibrio en Ingresos (BER): $${formatNumber(ber)}`,
        25,
        yPosition
      );
      yPosition += 6;
      doc.text(`Utilidad Total: $${formatNumber(utilidad)}`, 25, yPosition);
      yPosition += 6;
      doc.text(
        `Grado de Apalancamiento Operativo (GAO): ${
          gao !== null ? formatNumber(gao) : "N/A"
        }`,
        25,
        yPosition
      );
      yPosition += 6;
      doc.text(
        `Índice de Riesgo Operativo (IRO): ${formatNumber(iro)} (${(
          iro * 100
        ).toFixed(2)}%)`,
        25,
        yPosition
      );
      yPosition += 6;
      doc.text(`Nivel de Riesgo: ${getRiesgoTexto(iro)}`, 25, yPosition);
      yPosition += 10;

      // Interpretación del riesgo
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      const explicacion = getRiesgoExplicacion(iro);
      const lines = doc.splitTextToSize(explicacion, pageWidth - 50);
      doc.text(lines, 25, yPosition);

      // Descargar el PDF
      doc.save(
        `Analisis_Punto_Equilibrio_${new Date()
          .toLocaleDateString("es-ES")
          .replace(/\//g, "_")}.pdf`
      );
      alert("✅ PDF generado exitosamente");
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("❌ Error al generar el PDF. Por favor, intenta nuevamente.");
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Título */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Análisis del Punto de Equilibrio y Riesgo Operativo
        </h1>
        <p className="text-slate-600">
          Bienvenido/a Jean Marko Flores, analiza la rentabilidad de tu empresa
        </p>
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="mb-6 space-y-3">
          {alertas.map((alerta, index) => (
            <div
              key={index}
              className="bg-white border-l-4 border-red-500 p-4 rounded-lg shadow-md"
            >
              <p className="text-sm font-medium text-slate-800">{alerta}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de Inputs */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <h2 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <span className="text-2xl">📊</span> Datos de Entrada
          </h2>

          <div className="space-y-5">
            {/* Costos Fijos */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Costos Fijos Totales (CF)
              </label>
              <input
                type="number"
                value={cf}
                onChange={(e) => setCf(Number(e.target.value))}
                className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg focus:ring-2 focus:ring-[#A3E635] focus:border-transparent transition"
                min="0"
                step="100"
              />
            </div>

            {/* Costo Variable Unitario */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Costo Variable Unitario (CVU)
              </label>
              <input
                type="number"
                value={cvu}
                onChange={(e) => setCvu(Number(e.target.value))}
                className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg focus:ring-2 focus:ring-[#A3E635] focus:border-transparent transition"
                min="0"
                step="1"
              />
            </div>

            {/* Precio de Venta Unitario */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Precio de Venta Unitario (PVU)
              </label>
              <input
                type="number"
                value={pvu}
                onChange={(e) => setPvu(Number(e.target.value))}
                className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg focus:ring-2 focus:ring-[#A3E635] focus:border-transparent transition"
                min="0"
                step="1"
              />
            </div>

            {/* Cantidad Vendida */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Cantidad Vendida (Q)
              </label>
              <input
                type="number"
                value={q}
                onChange={(e) => setQ(Number(e.target.value))}
                className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg focus:ring-2 focus:ring-[#A3E635] focus:border-transparent transition"
                min="0"
                step="10"
              />
            </div>

            {/* Cálculos del Punto de Equilibrio */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span>🧮</span> Cálculos del Punto de Equilibrio
              </h3>

              {/* Cálculo de BEU */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  Punto de Equilibrio en Unidades (BEU):
                </p>
                <div className="space-y-1 text-sm text-slate-700">
                  <p className="font-mono">BEU = CF / (PVU - CVU)</p>
                  <p className="font-mono">
                    BEU = {formatNumber(cf)} / ({formatNumber(pvu)} -{" "}
                    {formatNumber(cvu)})
                  </p>
                  <p className="font-mono">
                    BEU = {formatNumber(cf)} / {formatNumber(mcu)}
                  </p>
                  <p className="font-mono font-bold text-blue-900 pt-2 border-t border-blue-200">
                    BEU = {formatNumber(beu)} unidades
                  </p>
                </div>
              </div>

              {/* Cálculo de GAO */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
                <p className="text-sm font-semibold text-purple-900 mb-2">
                  Grado de Apalancamiento Operativo (GAO):
                </p>
                <div className="space-y-1 text-sm text-slate-700">
                  <p className="font-mono">GAO = (Q × MCU) / (Q × MCU - CF)</p>
                  <p className="font-mono">
                    GAO = ({formatNumber(q)} × {formatNumber(mcu)}) / (
                    {formatNumber(q)} × {formatNumber(mcu)} - {formatNumber(cf)}
                    )
                  </p>
                  <p className="font-mono">
                    GAO = {formatNumber(q * mcu)} / ({formatNumber(q * mcu)} -{" "}
                    {formatNumber(cf)})
                  </p>
                  <p className="font-mono">
                    GAO = {formatNumber(q * mcu)} / {formatNumber(q * mcu - cf)}
                  </p>
                  <p className="font-mono font-bold text-purple-900 pt-2 border-t border-purple-200">
                    GAO ={" "}
                    {gao !== null
                      ? formatNumber(gao)
                      : "N/A (Ventas no superan costos fijos)"}
                  </p>
                </div>
              </div>

              {/* Cálculo de IRO */}
              <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                <p className="text-sm font-semibold text-teal-900 mb-2">
                  Índice de Riesgo Operativo (IRO):
                </p>
                <div className="space-y-1 text-sm text-slate-700">
                  <p className="font-mono">IRO = CF / (CF + Q × MCU)</p>
                  <p className="font-mono">
                    IRO = {formatNumber(cf)} / ({formatNumber(cf)} +{" "}
                    {formatNumber(q)} × {formatNumber(mcu)})
                  </p>
                  <p className="font-mono">
                    IRO = {formatNumber(cf)} / ({formatNumber(cf)} +{" "}
                    {formatNumber(q * mcu)})
                  </p>
                  <p className="font-mono">
                    IRO = {formatNumber(cf)} / {formatNumber(cf + q * mcu)}
                  </p>
                  <p className="font-mono font-bold text-teal-900 pt-2 border-t border-teal-200">
                    IRO = {formatNumber(iro)} ({(iro * 100).toFixed(2)}%)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de Resultados */}
        <div className="flex flex-col gap-6">
          {/* Punto de Equilibrio */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🎯</span> Punto de Equilibrio
            </h2>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-slate-600 mb-1">Unidades (BEU)</p>
                <p className="text-3xl font-bold text-blue-600">
                  {formatNumber(beu)} unidades
                </p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <p className="text-sm text-slate-600 mb-1">Ingresos (BER)</p>
                <p className="text-3xl font-bold text-indigo-600">
                  ${formatNumber(ber)}
                </p>
              </div>
            </div>
          </div>

          {/* Gráfica Visual Simple */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span> Visualización
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-600">
                    Ventas Actuales
                  </span>
                  <span className="text-sm font-semibold text-slate-900">
                    {q} unidades
                  </span>
                </div>
                <div className="relative h-8 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="absolute h-full bg-blue-500 transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        (q / Math.max(q, beu, 1)) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-600">
                    Punto de Equilibrio
                  </span>
                  <span className="text-sm font-semibold text-slate-900">
                    {formatNumber(beu)} unidades
                  </span>
                </div>
                <div className="relative h-8 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="absolute h-full bg-orange-500 transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        (beu / Math.max(q, beu, 1)) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg mt-4 border border-slate-200">
                <p className="text-sm text-slate-700">
                  {q > beu ? (
                    <span className="text-green-600 font-semibold">
                      ✓ Estás operando con utilidades. Has superado el punto de
                      equilibrio por {formatNumber(q - beu)} unidades.
                    </span>
                  ) : q === beu ? (
                    <span className="text-yellow-600 font-semibold">
                      ⚠ Estás en el punto de equilibrio. No hay ni ganancias ni
                      pérdidas.
                    </span>
                  ) : (
                    <span className="text-red-600 font-semibold">
                      ✗ Estás operando con pérdidas. Necesitas vender{" "}
                      {formatNumber(beu - q)} unidades más para alcanzar el
                      punto de equilibrio.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Métricas Económicas */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📈</span> Métricas Económicas
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-slate-700 font-medium">
                  Margen de Contribución (MCU)
                </span>
                <span className="text-lg font-bold text-slate-900">
                  ${formatNumber(mcu)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-slate-700 font-medium">
                  Utilidad Actual
                </span>
                <span
                  className={`text-lg font-bold ${
                    utilidad >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  ${formatNumber(utilidad)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-slate-700 font-medium">
                  Grado de Apalancamiento (GAO)
                </span>
                <span className="text-lg font-bold text-slate-900">
                  {gao !== null ? formatNumber(gao) : "N/A"}
                </span>
              </div>

              <div className="py-2">
                <span className="text-slate-700 font-medium block mb-2">
                  Índice de Riesgo Operativo (IRO)
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        iro < 0.3
                          ? "bg-green-500"
                          : iro < 0.6
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(iro * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-lg font-bold text-slate-900 w-20 text-right">
                    {formatNumber(iro * 100)}%
                  </span>
                </div>
                <div className="mt-2">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getRiesgoColor(
                      iro
                    )}`}
                  >
                    {getRiesgoTexto(iro)}
                  </span>
                </div>
                <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {getRiesgoExplicacion(iro)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfica del Punto de Equilibrio */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
            <span className="text-2xl">📈</span> Gráfica del Punto de Equilibrio
          </h3>
          <button
            onClick={generarPDF}
            className="bg-[#A3E635] hover:bg-[#84cc16] text-slate-900 px-6 py-2.5 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Generar PDF
          </button>
        </div>

        {/* Gráfica */}
        <div className="relative h-96 bg-slate-50 rounded-lg p-4 mb-4 border border-slate-200">
          <svg
            className="w-full h-full"
            viewBox="0 0 600 400"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Ejes */}
            <line
              x1="50"
              y1="350"
              x2="550"
              y2="350"
              stroke="#333"
              strokeWidth="2"
            />
            <line
              x1="50"
              y1="350"
              x2="50"
              y2="50"
              stroke="#333"
              strokeWidth="2"
            />

            {/* Etiquetas de ejes */}
            <text
              x="300"
              y="385"
              textAnchor="middle"
              fill="#333"
              fontSize="14"
              fontWeight="bold"
            >
              Unidades Vendidas (Q)
            </text>
            <text
              x="20"
              y="200"
              textAnchor="middle"
              fill="#333"
              fontSize="14"
              fontWeight="bold"
              transform="rotate(-90 20 200)"
            >
              Dinero ($)
            </text>

            {/* Cálculos para la gráfica */}
            {(() => {
              const maxQ = Math.max(capacidadMaxima, beu * 1.5, q * 1.2, 1);
              const maxMoney = Math.max(maxQ * pvu * 1.2, 1);
              const scaleX = 500 / maxQ;
              const scaleY = 300 / maxMoney;

              // Función helper para asegurar valores válidos
              const safe = (value: number) =>
                isNaN(value) || !isFinite(value) ? 0 : value;

              // Puntos de la línea de Ingresos Totales
              const ingresosX1 = 50;
              const ingresosY1 = 350;
              const ingresosX2 = safe(50 + maxQ * scaleX);
              const ingresosY2 = safe(350 - maxQ * pvu * scaleY);

              // Puntos de la línea de Costos Totales
              const costosX1 = 50;
              const costosY1 = safe(350 - cf * scaleY);
              const costosX2 = safe(50 + maxQ * scaleX);
              const costosY2 = safe(350 - (cf + maxQ * cvu) * scaleY);

              // Punto de equilibrio
              const beuX = safe(50 + beu * scaleX);
              const beuY = safe(350 - ber * scaleY);

              // Punto actual de ventas
              const qActualX = safe(50 + q * scaleX);
              const qActualIngresos = q * pvu;
              const qActualIngresosY = safe(350 - qActualIngresos * scaleY);

              return (
                <>
                  {/* Área de pérdidas (roja) - debajo del punto de equilibrio */}
                  {beu > 0 && (
                    <polygon
                      points={`50,${costosY1} ${beuX},${beuY} ${beuX},350 50,350`}
                      fill="rgba(239, 68, 68, 0.15)"
                      stroke="none"
                    />
                  )}

                  {/* Área de ganancias (verde) - después del punto de equilibrio */}
                  {beu > 0 && beu < maxQ && (
                    <polygon
                      points={`${beuX},${beuY} ${ingresosX2},${ingresosY2} ${costosX2},${costosY2}`}
                      fill="rgba(34, 197, 94, 0.15)"
                      stroke="none"
                    />
                  )}

                  {/* Línea de Costos Fijos (horizontal) */}
                  <line
                    x1={costosX1}
                    y1={costosY1}
                    x2={costosX2}
                    y2={costosY1}
                    stroke="#9333ea"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                  />

                  {/* Línea de Ingresos Totales (verde) */}
                  <line
                    x1={ingresosX1}
                    y1={ingresosY1}
                    x2={ingresosX2}
                    y2={ingresosY2}
                    stroke="#22c55e"
                    strokeWidth="3"
                  />

                  {/* Línea de Costos Totales (roja) */}
                  <line
                    x1={costosX1}
                    y1={costosY1}
                    x2={costosX2}
                    y2={costosY2}
                    stroke="#ef4444"
                    strokeWidth="3"
                  />

                  {/* Punto de Equilibrio */}
                  <circle
                    cx={beuX}
                    cy={beuY}
                    r="6"
                    fill="#ff9800"
                    stroke="#fff"
                    strokeWidth="2"
                  />
                  <line
                    x1={beuX}
                    y1={beuY}
                    x2={beuX}
                    y2="350"
                    stroke="#ff9800"
                    strokeWidth="2"
                    strokeDasharray="3,3"
                  />

                  {/* Etiqueta del Punto de Equilibrio */}
                  <text
                    x={beuX}
                    y={beuY > 100 ? beuY - 15 : beuY + 25}
                    textAnchor="middle"
                    fill="#ff9800"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    PE: {formatNumber(beu)} u
                  </text>

                  {/* Punto actual de ventas */}
                  <circle
                    cx={qActualX}
                    cy={qActualIngresosY}
                    r="5"
                    fill="#3b82f6"
                    stroke="#fff"
                    strokeWidth="2"
                  />
                  <line
                    x1={qActualX}
                    y1={qActualIngresosY}
                    x2={qActualX}
                    y2="350"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeDasharray="3,3"
                  />

                  {/* Etiqueta de Ventas Actuales */}
                  <text
                    x={qActualX}
                    y={
                      qActualIngresosY > 100
                        ? qActualIngresosY - 15
                        : qActualIngresosY + 25
                    }
                    textAnchor="middle"
                    fill="#3b82f6"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    Ventas Actuales
                  </text>
                </>
              );
            })()}
          </svg>
        </div>

        {/* Interpretación del Gráfico */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
            <span>💡</span> Interpretación del Gráfico
          </h4>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-green-500"></div>
              <span>
                <strong>Línea Verde:</strong> Ingresos Totales (aumentan con
                cada venta)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-red-500"></div>
              <span>
                <strong>Línea Roja:</strong> Costos Totales (fijos + variables)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>
                <strong>Punto Naranja:</strong> Punto de Equilibrio (donde
                ingresos = costos)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>
                <strong>Punto Azul:</strong> Ventas Actuales
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
