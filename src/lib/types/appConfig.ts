/**
 * Configuración de la Aplicación
 * Almacena configuraciones globales como credenciales de admin
 */

export interface AppConfig {
  id: string;
  adminUsername: string;
  adminPassword: string; // Texto plano (para uso interno)
  updatedAt: Date;
}
