
import { IconBell, IconMenu, IconSearch } from '@tabler/icons-react';
import React, { useState } from 'react';


const Breadcrumb = ({ setMobileOpen }: { setMobileOpen: (open: boolean) => void }) => {

  return (
        <header className="h-24 bg-[#FFFBF5] backdrop-blur-md border-b border-stone-200 flex items-center justify-between px-6 sticky top-0 z-30">
          
          <div className="flex items-center gap-4">
            {/* Botón Hamburguesa (Solo Móvil) */}
            <button 
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 text-stone-600 hover:bg-stone-100 rounded-lg"
            >
              <IconMenu size={24} />
            </button>
            
            <h2 className="text-xl font-bold text-stone-800 hidden sm:block">
              Panel de Control
            </h2>
          </div>

          {/* Acciones Derecha (Búsqueda, Notificaciones) */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex relative">
                <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input 
                    type="text" 
                    placeholder="Buscar..." 
                    className="pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-full text-sm focus:outline-none focus:border-[#A3E635] focus:ring-2 focus:ring-[#A3E635]/20 transition-all w-64"
                />
            </div>
            
            <button className="relative p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors">
               <IconBell size={20} />
               <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#FFFBF5]"></span>
            </button>
          </div>
        </header>
  );
};

export default Breadcrumb;