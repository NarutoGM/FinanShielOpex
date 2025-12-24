'use client';

import { Poppins } from "next/font/google";
import "../globals.css"; 
import { usePathname } from "next/navigation";
import Sidebar from "@/components/panel/Sidebar";
import { useState } from "react";
import Breadcrumb from "@/components/panel/Breadcrumb";
// import { SessionProvider } from "next-auth/react"; // Si no lo usas aquí, puedes comentarlo

const poppins = Poppins({
  weight: ["100","200","300","400","500","600","700","800","900"],
  variable: "--font-poppins",
  subsets: ["latin"],
});

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    // CAMBIO 1: Usamos 'h-screen' y 'overflow-hidden' para que la ventana NO haga scroll
    <div className={`${poppins.variable} flex h-screen overflow-hidden`}>
    
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* CAMBIO 2: Agregamos 'overflow-y-auto' para que SOLO el contenido baje */}
      <main className="flex-1 bg-[#FFFBF5] overflow-y-auto">
            
            {/* Opcional: Un contenedor interior si quieres márgenes consistentes */}
            <div className="p-4 md:p-6">
                {/* <Breadcrumb setMobileOpen={setMobileOpen} /> */}
                {children}
            </div>

      </main>

    </div>
  );
}