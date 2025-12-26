"use client";

import { useState, useEffect, useCallback } from "react";

// Tipos
interface User {
  nombre: string;
  dni: string;
  correo: string;
  contraseña: string;
}

export default function Home() {
  // Estados de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState<boolean>(true);

  // Estados del formulario de autenticación
  const [formData, setFormData] = useState({
    nombre: "",
    dni: "",
    correo: "",
    contraseña: "",
  });
  const [authError, setAuthError] = useState<string>("");

  // Estados para los inputs del dashboard
  const [cf, setCf] = useState<number>(10000); // Costos Fijos
  const [cvu, setCvu] = useState<number>(50); // Costo Variable Unitario
  const [pvu, setPvu] = useState<number>(100); // Precio de Venta Unitario
  const [q, setQ] = useState<number>(500); // Cantidad Vendida
  const [capacidadMaxima, setCapacidadMaxima] = useState<number>(1000); // Capacidad máxima estimada

  // Estados para los resultados calculados
  const [mcu, setMcu] = useState<number>(0); // Margen de Contribución Unitario
  const [beu, setBeu] = useState<number>(0); // Break-even en Unidades
  const [ber, setBer] = useState<number>(0); // Break-even en Ingresos
  const [gao, setGao] = useState<number | null>(null); // Grado de Apalancamiento Operativo
  const [iro, setIro] = useState<number>(0); // Índice de Riesgo Operativo
  const [utilidad, setUtilidad] = useState<number>(0); // Utilidad

  // Estados para alertas
  const [alertas, setAlertas] = useState<string[]>([]);

  // Verificar si hay sesión activa al cargar
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

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
    if (isAuthenticated) {
      calcularMetricas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cf, cvu, pvu, q, isAuthenticated]);

  // Funciones de autenticación
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setAuthError("");
  };

  const validateDNI = (dni: string): boolean => {
    return /^\d{8}$/.test(dni);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    // Validaciones
    if (!formData.nombre.trim()) {
      setAuthError("El nombre es obligatorio");
      return;
    }
    if (!validateDNI(formData.dni)) {
      setAuthError("El DNI debe tener exactamente 8 dígitos numéricos");
      return;
    }
    if (!formData.correo.trim() || !formData.correo.includes("@")) {
      setAuthError("Ingresa un correo válido");
      return;
    }
    if (!formData.contraseña || formData.contraseña.length < 6) {
      setAuthError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    // Obtener usuarios existentes
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    // Verificar si el correo ya existe
    if (users.find((u: User) => u.correo === formData.correo)) {
      setAuthError("Este correo ya está registrado");
      return;
    }

    // Verificar si el DNI ya existe
    if (users.find((u: User) => u.dni === formData.dni)) {
      setAuthError("Este DNI ya está registrado");
      return;
    }

    // Registrar nuevo usuario
    const newUser: User = {
      nombre: formData.nombre,
      dni: formData.dni,
      correo: formData.correo,
      contraseña: formData.contraseña,
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(newUser));

    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setFormData({ nombre: "", dni: "", correo: "", contraseña: "" });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    // Validaciones básicas
    if (!formData.correo.trim() || !formData.contraseña) {
      setAuthError("Por favor completa todos los campos");
      return;
    }

    // Obtener usuarios
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    // Buscar usuario
    const user = users.find(
      (u: User) =>
        u.correo === formData.correo && u.contraseña === formData.contraseña
    );

    if (!user) {
      setAuthError("Correo o contraseña incorrectos");
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify(user));
    setCurrentUser(user);
    setIsAuthenticated(true);
    setFormData({ nombre: "", dni: "", correo: "", contraseña: "" });
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setIsAuthenticated(false);
    setFormData({ nombre: "", dni: "", correo: "", contraseña: "" });
  };

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
      const pageHeight = doc.internal.pageSize.getHeight();
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
      doc.text("Analisis del Punto de Equilibrio", pageWidth / 2, yPosition, {
        align: "center",
      });
      yPosition += 10;

      // Información del usuario
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text(`Usuario: ${currentUser?.nombre}`, 20, yPosition);
      yPosition += 5;
      doc.text(`DNI: ${currentUser?.dni}`, 20, yPosition);
      yPosition += 5;
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
        `Margen de Contribucion (MCU): $${formatNumber(mcu)}`,
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
        `Indice de Riesgo Operativo (IRO): ${formatNumber(iro)} (${(
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
        `Analisis_Punto_Equilibrio_${currentUser?.nombre.replace(
          / /g,
          "_"
        )}.pdf`
      );
      alert("✅ PDF generado exitosamente");
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("❌ Error al generar el PDF. Por favor, intenta nuevamente.");
    }
  };

  // Si no está autenticado, mostrar pantalla de login/registro
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo y título */}
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
              <svg
                className="w-12 h-12 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              FinanShield OPEX
            </h1>
            <p className="text-gray-600">
              Sistema de Análisis del Punto de Equilibrio
            </p>
          </div>

          {/* Pestañas Login/Registro */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setShowLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                showLogin
                  ? "bg-white text-blue-600 shadow"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setShowLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                !showLogin
                  ? "bg-white text-blue-600 shadow"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* Mensaje de error */}
          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{authError}</p>
            </div>
          )}

          {/* Formulario de Login */}
          {showLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900"
                  placeholder="tu@correo.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  name="contraseña"
                  value={formData.contraseña}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Iniciar Sesión
              </button>
            </form>
          ) : (
            // Formulario de Registro
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900"
                  placeholder="Juan Pérez"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  DNI (8 dígitos)
                </label>
                <input
                  type="text"
                  name="dni"
                  value={formData.dni}
                  onChange={handleInputChange}
                  maxLength={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900"
                  placeholder="12345678"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900"
                  placeholder="tu@correo.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña (mínimo 6 caracteres)
                </label>
                <input
                  type="password"
                  name="contraseña"
                  value={formData.contraseña}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Crear Cuenta
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Dashboard - Solo visible después de autenticarse
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header del Dashboard con info del usuario */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  FinanShield OPEX
                </h2>
                <p className="text-xs text-gray-500">Dashboard</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Información del usuario */}
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {currentUser?.nombre}
                </p>
                <p className="text-xs text-gray-500">DNI: {currentUser?.dni}</p>
              </div>

              {/* Avatar del usuario */}
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {currentUser?.nombre.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Botón de cerrar sesión */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md hover:shadow-lg"
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
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido del Dashboard */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Título */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Análisis del Punto de Equilibrio y Riesgo Operativo
          </h1>
          <p className="text-gray-600">
            Bienvenido/a {currentUser?.nombre}, analiza la rentabilidad de tu
            empresa
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
                <p className="text-sm font-medium text-gray-800">{alerta}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel de Inputs */}
          <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">
              📊 Datos de Entrada
            </h2>

            <div className="space-y-5">
              {/* Costos Fijos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Costos Fijos Totales (CF)
                </label>
                <input
                  type="number"
                  value={cf}
                  onChange={(e) => setCf(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  min="0"
                  step="100"
                />
              </div>

              {/* Costo Variable Unitario */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Costo Variable Unitario (CVU)
                </label>
                <input
                  type="number"
                  value={cvu}
                  onChange={(e) => setCvu(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  min="0"
                  step="1"
                />
              </div>

              {/* Precio de Venta Unitario */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio de Venta Unitario (PVU)
                </label>
                <input
                  type="number"
                  value={pvu}
                  onChange={(e) => setPvu(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  min="0"
                  step="1"
                />
              </div>

              {/* Cantidad Vendida */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad Vendida (Q)
                </label>
                <input
                  type="number"
                  value={q}
                  onChange={(e) => setQ(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  min="0"
                  step="10"
                />
              </div>

              {/* Cálculos del Punto de Equilibrio */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  🧮 Cálculos del Punto de Equilibrio
                </h3>

                {/* Cálculo de BEU */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                  <p className="text-sm font-semibold text-blue-900 mb-2">
                    Punto de Equilibrio en Unidades (BEU):
                  </p>
                  <div className="space-y-1 text-sm text-gray-700">
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

                {/* Cálculo de BER
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 mb-4">
                  <p className="text-sm font-semibold text-indigo-900 mb-2">
                    Punto de Equilibrio en Ingresos (BER):
                  </p>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p className="font-mono">BER = BEU × PVU</p>
                    <p className="font-mono">
                      BER = {formatNumber(beu)} × {formatNumber(pvu)}
                    </p>
                    <p className="font-mono font-bold text-indigo-900 pt-2 border-t border-indigo-200">
                      BER = ${formatNumber(ber)}
                    </p>
                  </div>
                </div> */}

                {/* Cálculo de GAO */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
                  <p className="text-sm font-semibold text-purple-900 mb-2">
                    Grado de Apalancamiento Operativo (GAO):
                  </p>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p className="font-mono">
                      GAO = (Q × MCU) / (Q × MCU - CF)
                    </p>
                    <p className="font-mono">
                      GAO = ({formatNumber(q)} × {formatNumber(mcu)}) / (
                      {formatNumber(q)} × {formatNumber(mcu)} -{" "}
                      {formatNumber(cf)})
                    </p>
                    <p className="font-mono">
                      GAO = {formatNumber(q * mcu)} / ({formatNumber(q * mcu)} -{" "}
                      {formatNumber(cf)})
                    </p>
                    <p className="font-mono">
                      GAO = {formatNumber(q * mcu)} /{" "}
                      {formatNumber(q * mcu - cf)}
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
                  <div className="space-y-1 text-sm text-gray-700">
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
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
                🎯 Punto de Equilibrio
              </h2>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Unidades (BEU)</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {formatNumber(beu)} unidades
                  </p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <p className="text-sm text-gray-600 mb-1">Ingresos (BER)</p>
                  <p className="text-3xl font-bold text-indigo-600">
                    ${formatNumber(ber)}
                  </p>
                </div>
              </div>
            </div>

            {/* Gráfica Visual Simple */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
                📊 Visualización
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      Ventas Actuales
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {q} unidades
                    </span>
                  </div>
                  <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
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
                    <span className="text-sm text-gray-600">
                      Punto de Equilibrio
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatNumber(beu)} unidades
                    </span>
                  </div>
                  <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
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

                <div className="bg-gray-50 p-4 rounded-lg mt-4">
                  <p className="text-sm text-gray-700">
                    {q > beu ? (
                      <span className="text-green-600 font-semibold">
                        ✓ Estás operando con utilidades. Has superado el punto
                        de equilibrio por {formatNumber(q - beu)} unidades.
                      </span>
                    ) : q === beu ? (
                      <span className="text-yellow-600 font-semibold">
                        ⚠ Estás en el punto de equilibrio. No hay ni ganancias
                        ni pérdidas.
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
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
                📈 Métricas Económicas
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-700 font-medium">
                    Margen de Contribución (MCU)
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    ${formatNumber(mcu)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-700 font-medium">
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

                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-700 font-medium">
                    Grado de Apalancamiento (GAO)
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {gao !== null ? formatNumber(gao) : "N/A"}
                  </span>
                </div>

                <div className="py-2">
                  <span className="text-gray-700 font-medium block mb-2">
                    Índice de Riesgo Operativo (IRO)
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
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
                    <span className="text-lg font-bold text-gray-900 w-20 text-right">
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
                  <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {getRiesgoExplicacion(iro)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfica del Punto de Equilibrio */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
            📈 Gráfica del Punto de Equilibrio
          </h3>

          {/* Gráfica */}
          <div className="relative h-96 bg-gray-50 rounded-lg p-4 mb-4">
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
                const qActualCostos = cf + q * cvu;
                const qActualIngresosY = safe(350 - qActualIngresos * scaleY);
                const qActualCostosY = safe(350 - qActualCostos * scaleY);

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
                    <circle
                      cx={qActualX}
                      cy={qActualCostosY}
                      r="5"
                      fill="#ef4444"
                      stroke="#fff"
                      strokeWidth="2"
                    />
                    <line
                      x1={qActualX}
                      y1={qActualIngresosY}
                      x2={qActualX}
                      y2="350"
                      stroke="#3b82f6"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />

                    {/* Marcas en el eje X */}
                    {[0, 0.25, 0.5, 0.75, 1].map((factor) => {
                      const xPos = 50 + maxQ * factor * scaleX;
                      const value = maxQ * factor;
                      return (
                        <g key={factor}>
                          <line
                            x1={xPos}
                            y1="350"
                            x2={xPos}
                            y2="355"
                            stroke="#333"
                            strokeWidth="1"
                          />
                          <text
                            x={xPos}
                            y="370"
                            textAnchor="middle"
                            fill="#666"
                            fontSize="10"
                          >
                            {Math.round(value)}
                          </text>
                        </g>
                      );
                    })}

                    {/* Marcas en el eje Y */}
                    {[0, 0.25, 0.5, 0.75, 1].map((factor) => {
                      const yPos = 350 - maxMoney * factor * scaleY;
                      const value = maxMoney * factor;
                      return (
                        <g key={factor}>
                          <line
                            x1="45"
                            y1={yPos}
                            x2="50"
                            y2={yPos}
                            stroke="#333"
                            strokeWidth="1"
                          />
                          <text
                            x="40"
                            y={yPos + 4}
                            textAnchor="end"
                            fill="#666"
                            fontSize="10"
                          >
                            ${(value / 1000).toFixed(0)}k
                          </text>
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          </div>

          {/* Leyenda */}
          <div className="flex flex-wrap justify-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-green-500"></div>
              <span className="text-sm font-medium text-gray-700">
                Ingresos Totales
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-red-500"></div>
              <span className="text-sm font-medium text-gray-700">
                Costos Totales
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 border-t-2 border-dashed border-purple-500"></div>
              <span className="text-sm font-medium text-gray-700">
                Costos Fijos
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500"></div>
              <span className="text-sm font-medium text-gray-700">
                Punto de Equilibrio
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span className="text-sm font-medium text-gray-700">
                Ventas Actuales
              </span>
            </div>
          </div>

          {/* Interpretación */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border-l-4 border-blue-500">
            <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              Interpretación del Gráfico
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {q > beu ? (
                <>
                  <strong className="text-green-700">Zona de Ganancia:</strong>{" "}
                  Tu empresa opera en la zona verde (ganancias). Con{" "}
                  <strong>{q} unidades</strong> vendidas, superas el punto de
                  equilibrio de <strong>{formatNumber(beu)} unidades</strong>,
                  generando <strong>${formatNumber(utilidad)}</strong> de
                  utilidad. La línea verde (ingresos) está sobre la roja
                  (costos).
                </>
              ) : q < beu ? (
                <>
                  <strong className="text-red-700">Zona de Pérdida:</strong> Tu
                  empresa opera en la zona roja (pérdidas). Con{" "}
                  <strong>{q} unidades</strong> vendidas, estás bajo el punto de
                  equilibrio de <strong>{formatNumber(beu)} unidades</strong>,
                  generando una pérdida de{" "}
                  <strong>${formatNumber(Math.abs(utilidad))}</strong>.
                  Necesitas {formatNumber(beu - q)} unidades más para alcanzar
                  rentabilidad.
                </>
              ) : (
                <>
                  <strong className="text-yellow-700">
                    Punto de Equilibrio:
                  </strong>{" "}
                  Estás exactamente en el punto de equilibrio. Con{" "}
                  <strong>{q} unidades</strong>, cubres todos los costos sin
                  generar ganancias ni pérdidas. Este es el punto crítico donde
                  las líneas verde y roja se intersectan.
                </>
              )}
            </p>
          </div>

          {/* Botón de acción para PDF */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={generarPDF}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
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
        </div>

        {/* Footer con información adicional */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            💡 Interpretación de las Métricas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">
                Margen de Contribución (MCU)
              </h4>
              <p>
                Es la diferencia entre el precio de venta y el costo variable.
                Indica cuánto aporta cada unidad vendida para cubrir los costos
                fijos y generar utilidad.
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">
                Grado de Apalancamiento Operativo (GAO)
              </h4>
              <p>
                Mide cuánto cambian las utilidades ante cambios en las ventas.
                Un GAO alto indica mayor sensibilidad y riesgo.
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">
                Índice de Riesgo Operativo (IRO)
              </h4>
              <p>
                Indica la proporción de costos fijos en la estructura de costos
                total. Valores cercanos a 1 indican alto riesgo operativo.
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">
                Punto de Equilibrio
              </h4>
              <p>
                Es el nivel de ventas donde los ingresos totales igualan a los
                costos totales. No hay ganancia ni pérdida.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
