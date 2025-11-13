/**
 * Configuración del cliente de Prisma
 * Este módulo exporta una instancia singleton del cliente de Prisma
 * para ser utilizada en toda la aplicación
 */

import { PrismaClient } from "@prisma/client";

/**
 * Instancia del cliente de Prisma
 * Se configura con logging para desarrollo
 */
const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "info", "warn", "error"] // Logging detallado en desarrollo
      : ["warn", "error"], // Logging mínimo en producción
});

/**
 * Función para conectar a la base de datos
 * Verifica la conexión intentando una consulta simple
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    // Verificar conexión con una consulta simple
    await prisma.$connect();
    console.log("✅ Base de datos conectada correctamente");
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    console.error("❌ Error al conectar a la base de datos:", errorMessage);
    process.exit(1);
  }
};

/**
 * Función para desconectar de la base de datos
 * Se llama al cerrar la aplicación
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    console.log("🔌 Base de datos desconectada correctamente");
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    console.error("❌ Error al desconectar de la base de datos:", errorMessage);
  }
};

// Manejo de cierre de la aplicación
process.on("SIGINT", async () => {
  await disconnectDB();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await disconnectDB();
  process.exit(0);
});

export { connectDB, disconnectDB, prisma };
