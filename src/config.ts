import { Config } from "./models/config";

/**
 * Application configuration
 * Loads configuration from environment variables with fallback defaults
 */
const config: Config = {
  port: process.env.PORT || "3000",
  base_url: "/api/v1",
  jwt: {
    secret:
      process.env.JWT_SECRET ||
      "mi_clave_secreta_super_segura_cambiar_en_produccion_2024",
    expire: process.env.JWT_EXPIRE || "7d",
  },
  database_url:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/api_productos?schema=public",
};

export { config };
