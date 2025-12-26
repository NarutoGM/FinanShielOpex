import React, { useState } from "react";

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Estados para login
  const [email, setEmail] = useState("admin@finanshield.com");
  const [password, setPassword] = useState("admin123");
  const [loginError, setLoginError] = useState("");

  // Estados para registro
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dni, setDni] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (email && password) {
        onLoginSuccess();
        setLoginError("");
      } else {
        setLoginError("Credenciales inválidas");
      }
      setLoading(false);
    }, 1000);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterSuccess("");

    // Validaciones del frontend
    if (
      !firstName ||
      !lastName ||
      !dni ||
      !registerEmail ||
      !registerPassword ||
      !confirmPassword
    ) {
      setRegisterError("Todos los campos son obligatorios");
      return;
    }

    // Validar DNI (8 dígitos)
    if (!/^\d{8}$/.test(dni)) {
      setRegisterError("El DNI debe tener exactamente 8 dígitos numéricos");
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerEmail)) {
      setRegisterError("Formato de correo electrónico inválido");
      return;
    }

    // Validar que las contraseñas coincidan
    if (registerPassword !== confirmPassword) {
      setRegisterError("Las contraseñas no coinciden");
      return;
    }

    // Validar longitud de contraseña
    if (registerPassword.length < 6) {
      setRegisterError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          dni,
          email: registerEmail,
          password: registerPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setRegisterSuccess(
          "¡Usuario registrado exitosamente! Puedes iniciar sesión ahora."
        );
        // Limpiar formulario
        setFirstName("");
        setLastName("");
        setDni("");
        setRegisterEmail("");
        setRegisterPassword("");
        setConfirmPassword("");
        // Cambiar a modo login después de 2 segundos
        setTimeout(() => {
          setIsRegisterMode(false);
          setRegisterSuccess("");
        }, 2000);
      } else {
        setRegisterError(data.error || "Error al registrar usuario");
      }
    } catch (error) {
      setRegisterError("Error de conexión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setLoginError("");
    setRegisterError("");
    setRegisterSuccess("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-700 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setIsRegisterMode(false)}
            className={`flex-1 py-4 px-6 text-center font-semibold transition-all ${
              !isRegisterMode
                ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                : "text-slate-400 bg-slate-50 hover:bg-slate-100"
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => setIsRegisterMode(true)}
            className={`flex-1 py-4 px-6 text-center font-semibold transition-all ${
              isRegisterMode
                ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                : "text-slate-400 bg-slate-50 hover:bg-slate-100"
            }`}
          >
            Registrarse
          </button>
        </div>

        <div className="p-8">
          {!isRegisterMode ? (
            // Formulario de Login
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              {loginError && (
                <p className="text-red-500 text-sm text-center">{loginError}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg flex justify-center items-center transition-all"
              >
                {loading ? "Cargando..." : "Iniciar Sesión"}
              </button>
              <button
                type="button"
                onClick={() => setIsRegisterMode(true)}
                className="w-full bg-white hover:bg-slate-50 text-blue-600 font-semibold py-3 rounded-lg border-2 border-blue-600 flex justify-center items-center transition-all"
              >
                Crear Usuario
              </button>
            </form>
          ) : (
            // Formulario de Registro
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Juan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Pérez"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  DNI (8 dígitos)
                </label>
                <input
                  type="text"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  maxLength={8}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="12345678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="tu@correo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Repite la contraseña"
                />
              </div>
              {registerError && (
                <p className="text-red-500 text-sm text-center">
                  {registerError}
                </p>
              )}
              {registerSuccess && (
                <p className="text-green-600 text-sm text-center font-medium">
                  {registerSuccess}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg flex justify-center items-center transition-all"
              >
                {loading ? "Registrando..." : "Crear Cuenta"}
              </button>
            </form>
          )}
        </div>

        <div className="bg-slate-50 py-4 text-center border-t border-slate-200">
          <p className="text-xs text-slate-400">
            Versión Demo 2.2.0 | © 2024 FinanShield Analytics
          </p>
        </div>
      </div>
    </div>
  );
};
