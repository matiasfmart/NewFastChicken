"use client";

import * as React from "react";
import { initializeAPIsWithHttp } from "@/api/initializeAPIsClient";

/**
 * Admin Provider - Inicializa APIs para sección Admin
 *
 * ✅ ARQUITECTURA:
 * - Inicializa HTTP repositories una sola vez
 * - Permite que páginas admin usen las APIs
 * - Mantiene el desacoplamiento (páginas no saben de HTTP)
 */

interface AdminProviderProps {
  children: React.ReactNode;
}

export function AdminProvider({ children }: AdminProviderProps) {
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Inicializar APIs con HTTP repositories una sola vez
  React.useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    initializeAPIsWithHttp(apiUrl);
    setIsInitialized(true);
  }, []);

  // No renderizar hasta que las APIs estén inicializadas
  if (!isInitialized) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Inicializando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
