import { ComboAPI, InventoryAPI } from "@/api";
import { ClientShell } from "./client-shell";
import { initializeMongoDB } from "@/lib/mongodb-init";

/**
 * Home Page - Server Component
 *
 * ✅ ARQUITECTURA OPTIMIZADA A 4 CAPAS:
 * - Se ejecuta en el servidor
 * - Acceso directo a MongoDB vía APIs
 * - No envía JavaScript innecesario al cliente
 * - Preparado para futura separación backend/frontend
 *
 * FLUJO:
 * Server Component → APIs → MongoDB Repositories → MongoDB
 */

// CRÍTICO: Forzar renderizado dinámico para que NO use el HTML pre-generado durante build
// Durante el build, MongoDB usa un mock que retorna datos vacíos
// En runtime, necesitamos conectar a la DB real y obtener datos frescos
export const dynamic = 'force-dynamic';

export default async function Home() {
  // ✅ Inicializar MongoDB antes de cualquier llamada a APIs
  await initializeMongoDB();

  // ✅ Se ejecuta en el servidor - acceso directo a la base de datos
  const [combos, inventory] = await Promise.all([
    ComboAPI.getAll(),
    InventoryAPI.getAll()
  ]);

  // Pasar datos pre-fetched al Client Component
  return <ClientShell combos={combos} inventory={inventory} />;
}
