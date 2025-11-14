/**
 * Configuration Tests
 * Tests for application configuration
 */

describe("Application Configuration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("Default Configuration", () => {
    it("should use default port when PORT env var is not set", async () => {
      delete process.env.PORT;
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { config } = require("../../src/config");

      expect(config.port).toBe("3000");
    });

    it("should use PORT env var when set", async () => {
      process.env.PORT = "4000";
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { config } = require("../../src/config");

      expect(config.port).toBe("4000");
    });

    it("should have correct base_url", async () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { config } = require("../../src/config");

      expect(config.base_url).toBe("/api/v1");
    });
  });

  describe("JWT Configuration", () => {
    it("should use default JWT secret when not set", async () => {
      delete process.env.JWT_SECRET;
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { config } = require("../../src/config");

      expect(config.jwt.secret).toBe(
        "mi_clave_secreta_super_segura_cambiar_en_produccion_2024"
      );
    });

    it("should use JWT_SECRET env var when set", async () => {
      process.env.JWT_SECRET = "custom_secret_key";
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { config } = require("../../src/config");

      expect(config.jwt.secret).toBe("custom_secret_key");
    });

    it("should use default JWT expiration when not set", async () => {
      delete process.env.JWT_EXPIRE;
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { config } = require("../../src/config");

      expect(config.jwt.expire).toBe("7d");
    });

    it("should use JWT_EXPIRE env var when set", async () => {
      process.env.JWT_EXPIRE = "30d";
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { config } = require("../../src/config");

      expect(config.jwt.expire).toBe("30d");
    });
  });

  describe("Database Configuration", () => {
    it("should use default database URL when not set", async () => {
      delete process.env.DATABASE_URL;
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { config } = require("../../src/config");

      expect(config.database_url).toBe(
        "postgresql://postgres:postgres@localhost:5432/api_productos?schema=public"
      );
    });

    it("should use DATABASE_URL env var when set", async () => {
      process.env.DATABASE_URL =
        "postgresql://user:pass@db.example.com:5432/mydb";
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { config } = require("../../src/config");

      expect(config.database_url).toBe(
        "postgresql://user:pass@db.example.com:5432/mydb"
      );
    });
  });

  describe("Configuration Structure", () => {
    it("should have all required configuration properties", async () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { config } = require("../../src/config");

      expect(config).toHaveProperty("port");
      expect(config).toHaveProperty("base_url");
      expect(config).toHaveProperty("jwt");
      expect(config).toHaveProperty("database_url");
    });

    it("should have JWT configuration with secret and expire", async () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { config } = require("../../src/config");

      expect(config.jwt).toHaveProperty("secret");
      expect(config.jwt).toHaveProperty("expire");
    });

    it("should export config as named export", async () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const configModule = require("../../src/config");

      expect(configModule).toHaveProperty("config");
      expect(typeof configModule.config).toBe("object");
    });
  });
});
