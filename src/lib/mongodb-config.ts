/**
 * MongoDB Configuration
 *
 * Configuración centralizada para la conexión a MongoDB
 */

export const mongoDBConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
  database: process.env.MONGODB_DATABASE || 'fastchicken',
  options: {
    // Opciones de conexión recomendadas
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  }
};
