/**
 * MongoDB Configuration
 *
 * Configuración centralizada y validada para la conexión a MongoDB
 * Soporta tanto MongoDB local como MongoDB Atlas
 */

// ✅ Validación de variables de entorno SOLO en runtime (no durante build)
if (process.env.NEXT_PHASE !== "phase-production-build") {
  if (!process.env.MONGODB_USER && !process.env.MONGODB_URI) {
    throw new Error(
      'Invalid/Missing environment variable: "MONGODB_USER" or "MONGODB_URI"'
    );
  }
  if (process.env.MONGODB_USER && !process.env.MONGODB_PASSWORD) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_PASSWORD"');
  }
  if (process.env.MONGODB_USER && !process.env.MONGODB_CLUSTER_URL) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_CLUSTER_URL"');
  }
  if (!process.env.MONGODB_DB_NAME) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_DB_NAME"');
  }
}

// Usar valores dummy durante el build, reales en runtime
const MONGODB_USER = process.env.MONGODB_USER || "dummy";
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD || "dummy";
const MONGODB_CLUSTER_URL = process.env.MONGODB_CLUSTER_URL || "dummy.mongodb.net";
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "fastchicken";

// Construir URI: si hay MONGODB_URI usar esa, sino construir desde partes
const uri = process.env.MONGODB_URI
  ? process.env.MONGODB_URI
  : `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_CLUSTER_URL}/?retryWrites=true&w=majority&appName=Cluster0`;

export const mongoDBConfig = {
  uri,
  database: MONGODB_DB_NAME,
  options: {
    // SSL/TLS configuration para compatibilidad con Windows
    tls: true,
    tlsAllowInvalidCertificates: true, // Para evitar errores SSL en Windows
    tlsAllowInvalidHostnames: false,
    // Timeouts para mejor estabilidad
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    // Pool de conexiones
    maxPoolSize: 10,
    minPoolSize: 2,
  }
};
