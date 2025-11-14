import app from "./app";
import { config } from "./config";

// Start Express server
const server = app.listen(config.port, () => {
  console.log("===========================================");
  console.log(`🚀 Servidor ejecutándose en puerto ${config.port}`);
  console.log(`📍 URL: http://localhost:${config.port}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || "development"}`);
  console.log("===========================================");
});

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

export default server;
