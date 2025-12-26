"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  IconUser,
  IconLock,
  IconEye,
  IconEyeOff,
  IconArrowRight,
  IconLoader2,
} from "@tabler/icons-react";

const Login = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({ user: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Estados para registro
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    dni: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");

  const publicName = process.env.NEXT_PUBLIC_NAME || "TuMarca";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    setRegisterError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: formData.user,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al iniciar sesión");
      }

      console.log("Login exitoso:", data);
      localStorage.setItem("token", data.token);
      localStorage.setItem("userData", JSON.stringify(data.user));
      router.push("/panel");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterSuccess("");

    // Validaciones
    if (
      !registerData.firstName ||
      !registerData.lastName ||
      !registerData.dni ||
      !registerData.email ||
      !registerData.password ||
      !registerData.confirmPassword
    ) {
      setRegisterError("Todos los campos son obligatorios");
      return;
    }

    if (!/^\d{8}$/.test(registerData.dni)) {
      setRegisterError("El DNI debe tener exactamente 8 dígitos");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.email)) {
      setRegisterError("Formato de correo electrónico inválido");
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError("Las contraseñas no coinciden");
      return;
    }

    if (registerData.password.length < 6) {
      setRegisterError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: registerData.firstName,
          lastName: registerData.lastName,
          dni: registerData.dni,
          email: registerData.email,
          password: registerData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al registrar usuario");
      }

      setRegisterSuccess("¡Usuario registrado exitosamente!");
      setTimeout(() => {
        setIsRegisterMode(false);
        setRegisterSuccess("");
        setRegisterData({
          firstName: "",
          lastName: "",
          dni: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
      }, 2000);
    } catch (err: any) {
      setRegisterError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFBF5] px-4 font-sans text-stone-600">
      {/* Contenedor Principal (Tarjeta) */}
      <div className="w-full max-w-[420px] animate-in fade-in zoom-in duration-500">
        <div className="bg-white rounded-[2rem] shadow-xl shadow-stone-200/50 border border-stone-100 p-8 md:p-10 relative overflow-hidden">
          {/* Decoración de fondo sutil */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-stone-900 via-[#A3E635] to-stone-900"></div>

          {/* --- HEADER: LOGO Y TÍTULO --- */}
          <div className="text-center mb-10">
            <div className="inline-flex justify-center mb-6">
              <Image
                src="/img/logo/logo.png"
                alt="Logo Empresa"
                width={200}
                height={50}
                className="h-48 w-auto object-contain"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-stone-900 mb-2">
              {isRegisterMode ? "¡Crear Usuario!" : "¡Hola de nuevo!"}
            </h1>
            <p className="text-sm text-stone-400">
              {isRegisterMode
                ? "Completa el formulario para registrarte."
                : "Ingresa tus credenciales para continuar."}
            </p>
          </div>

          {/* --- FORMULARIO --- */}
          {!isRegisterMode ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Input Usuario */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider ml-1">
                  Usuario (Email)
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <IconUser
                      size={18}
                      className="text-stone-400 group-focus-within:text-[#A3E635] transition-colors"
                    />
                  </div>
                  <input
                    type="text"
                    name="user"
                    required
                    value={formData.user}
                    onChange={handleChange}
                    placeholder="ej. developer@gmail.com"
                    className="w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#A3E635]/50 focus:border-[#A3E635] transition-all"
                  />
                </div>
              </div>

              {/* Input Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Contraseña
                  </label>
                  <a
                    href="#"
                    className="text-xs text-stone-400 hover:text-stone-900 transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <IconLock
                      size={18}
                      className="text-stone-400 group-focus-within:text-[#A3E635] transition-colors"
                    />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#A3E635]/50 focus:border-[#A3E635] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-stone-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <IconEyeOff size={18} />
                    ) : (
                      <IconEye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Mensaje de Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 flex items-center animate-in slide-in-from-top-2">
                  <span className="mr-2">⚠️</span> {error}
                </div>
              )}

              {/* Botón Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full group relative flex justify-center py-3.5 px-4 border border-transparent rounded-xl text-white bg-stone-900 hover:bg-[#A3E635] hover:text-stone-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-900 font-bold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <IconLoader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Iniciar Sesión
                    <IconArrowRight
                      size={18}
                      className="ml-2 opacity-70 group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>

              {/* Botón Crear Usuario */}
              <button
                type="button"
                onClick={() => setIsRegisterMode(true)}
                className="w-full group relative flex justify-center py-3.5 px-4 border-2 border-stone-900 rounded-xl text-stone-900 bg-white hover:bg-stone-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-900 font-bold transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Crear Usuario
                <IconArrowRight
                  size={18}
                  className="ml-2 opacity-70 group-hover:translate-x-1 transition-transform"
                />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Nombre y Apellido */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider ml-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={registerData.firstName}
                    onChange={handleRegisterChange}
                    placeholder="Juan"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#A3E635]/50 focus:border-[#A3E635] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider ml-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={registerData.lastName}
                    onChange={handleRegisterChange}
                    placeholder="Pérez"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#A3E635]/50 focus:border-[#A3E635] transition-all"
                  />
                </div>
              </div>

              {/* DNI */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider ml-1">
                  DNI (8 dígitos)
                </label>
                <input
                  type="text"
                  name="dni"
                  required
                  maxLength={8}
                  value={registerData.dni}
                  onChange={handleRegisterChange}
                  placeholder="12345678"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#A3E635]/50 focus:border-[#A3E635] transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider ml-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  placeholder="tu@correo.com"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#A3E635]/50 focus:border-[#A3E635] transition-all"
                />
              </div>

              {/* Contraseña */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider ml-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#A3E635]/50 focus:border-[#A3E635] transition-all"
                />
              </div>

              {/* Confirmar Contraseña */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider ml-1">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={registerData.confirmPassword}
                  onChange={handleRegisterChange}
                  placeholder="Repite la contraseña"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#A3E635]/50 focus:border-[#A3E635] transition-all"
                />
              </div>

              {/* Mensajes de error/éxito */}
              {registerError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 flex items-center">
                  <span className="mr-2">⚠️</span> {registerError}
                </div>
              )}
              {registerSuccess && (
                <div className="p-3 bg-green-50 border border-green-100 rounded-lg text-xs text-green-600 flex items-center">
                  <span className="mr-2">✓</span> {registerSuccess}
                </div>
              )}

              {/* Botones */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full group relative flex justify-center py-3.5 px-4 border border-transparent rounded-xl text-white bg-stone-900 hover:bg-[#A3E635] hover:text-stone-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-900 font-bold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <IconLoader2 className="animate-spin" size={20} />
                ) : (
                  "Crear Cuenta"
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsRegisterMode(false)}
                className="w-full py-3 text-sm text-stone-600 hover:text-stone-900 font-medium"
              >
                ← Volver al inicio de sesión
              </button>
            </form>
          )}

          {/* Footer Copyright */}
          <p className="text-center text-xs text-stone-400 mt-8">
            © {new Date().getFullYear()} {publicName}. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
