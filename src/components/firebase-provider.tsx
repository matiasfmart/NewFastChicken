
"use client";
import React, { createContext, useEffect, useState, useMemo } from 'react';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from '@/lib/firebase-config';
import { initializeAPIs } from '@/api/initializeAPIs';
import type { FirebaseApp } from 'firebase/app';

interface FirebaseContextType {
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
  isInitialized: boolean;
}

export const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

// Inicializar Firebase INMEDIATAMENTE fuera del componente
// Esto evita que se reinicialice en cada render
let firebaseApp: FirebaseApp;
if (typeof window !== 'undefined') {
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApp();
  }
}

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  // Usar useMemo para crear las instancias solo una vez
  const firebaseInstances = useMemo(() => {
    if (typeof window === 'undefined') {
      return { app: null, auth: null, firestore: null };
    }

    const auth = getAuth(firebaseApp);
    const firestore = getFirestore(firebaseApp);

    return {
      app: firebaseApp,
      auth,
      firestore
    };
  }, []);

  useEffect(() => {
    // Inicializar APIs con Firestore de forma sincrónica
    if (firebaseInstances.firestore) {
      initializeAPIs(firebaseInstances.firestore);
      // Marcar como inicializado DESPUÉS de que las APIs estén listas
      setIsInitialized(true);
    }
  }, [firebaseInstances]);

  const contextValue = useMemo(() => ({
    ...firebaseInstances,
    isInitialized
  }), [firebaseInstances, isInitialized]);

  // No renderizar children hasta que las APIs estén inicializadas
  if (!isInitialized) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Inicializando aplicación...</p>
        </div>
      </div>
    );
  }

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
};
