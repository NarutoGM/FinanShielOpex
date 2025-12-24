'use client';

import React, { useState, useEffect } from 'react'; // <--- 1. Agregamos useEffect y useState
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { 
  FileText, 
  Users, 
  LogOut, 
  X,
  ChevronRight,
  Tag
} from 'lucide-react';
import { IconUser } from '@tabler/icons-react';

const MENU_ITEMS = [
  { name: 'Mis Proyectos', icon: IconUser, path: '/panel' },
];

export default function Sidebar({ mobileOpen, setMobileOpen }: { mobileOpen: boolean; setMobileOpen: (open: boolean) => void }) {
  const pathname = usePathname();
  const router = useRouter();

  // --- 2. ESTADO PARA GUARDAR LOS DATOS DEL USUARIO ---
  const [userData, setUserData] = useState({
    name: 'Cargando...',
    email: '',
    initials: '...'
  });

  // --- 3. EFECTO PARA LEER EL TOKEN AL CARGAR ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        // Decodificamos la parte media del JWT (Payload) sin librerías externas
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);

        // Extraemos datos. 
        // NOTA: Depende de cómo creaste el token en el backend. 
        // Si tu token tiene 'name', úsalo. Si no, usamos el 'role' o parte del email.
        const name = payload.name || payload.role || 'Usuario';
        const email = payload.email || '';
        const initials = (name.slice(0, 2)).toUpperCase();

        setUserData({ name, email, initials });

      } catch (error) {
        console.error("Error leyendo token:", error);
        setUserData({ name: 'Invitado', email: '', initials: 'GB' });
      }
    }
  }, []);

  const handleLogout = () => {
    if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
        localStorage.removeItem('token');
        router.push('/login');
    }
  };

  return (
    <>
      {/* OVERLAY MÓVIL */}
      <div 
        className={`fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* SIDEBAR */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-stone-200 shadow-xl lg:shadow-none transform transition-transform duration-300 ease-in-out flex flex-col ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        
        {/* HEADER LOGO */}
        <div className="h-24 flex items-center justify-center px-8 border-b border-stone-100">
          <Image 
            src="/img/logo/logo.png" 
            alt="Logo" 
            width={300} 
            height={96}
            className="h-30 w-auto object-contain" 
          />
          <button onClick={() => setMobileOpen(false)} className="ml-auto lg:hidden text-stone-400 hover:text-stone-900">
            <X size={24} />
          </button>
        </div>

        {/* NAVEGACIÓN */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          <p className="px-4 text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
            Menu Principal
          </p>
          
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <Link 
                key={item.path} 
                href={item.path}
                onClick={() => setMobileOpen(false)}
                className={`group relative flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#A3E635] text-stone-900 font-bold shadow-lg shadow-[#A3E635]/20' 
                    : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900 font-medium'
                }`}
              >
                <Icon size={20} className={`mr-3 transition-colors ${isActive ? 'text-stone-900' : 'text-stone-400 group-hover:text-stone-900'}`} />
                <span className="flex-1">{item.name}</span>
                {isActive && <ChevronRight size={16} className="text-stone-900 opacity-50" />}
              </Link>
            );
          })}
        </nav>

        {/* 4. PERFIL USUARIO DINÁMICO */}
        <div className="p-4 border-t border-stone-100">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-100">
            
            {/* Iniciales Dinámicas */}
            <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 font-bold uppercase">
              {userData.initials}
            </div>
            
            {/* Nombre y Email Dinámicos */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-stone-900 truncate capitalize">
                {userData.name}
              </p>
              <p className="text-xs text-stone-500 truncate" title={userData.email}>
                {userData.email}
              </p>
            </div>

            <button 
              onClick={handleLogout}
              className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

      </aside>
    </>
  );
}