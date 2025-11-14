/**
 * Swagger Configuration Tests
 * Tests for Swagger/OpenAPI documentation setup
 */

import request from "supertest";

import app from "../../src/app";
import { swaggerSpec } from "../../src/tools/swagger";

describe("Swagger Configuration", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const spec = swaggerSpec as any;

  describe("Swagger Specification", () => {
    it("should have valid OpenAPI version", () => {
      expect(spec.openapi).toBe("3.0.0");
    });

    it("should have API title", () => {
      expect(spec.info.title).toBe("Remedial IPG - Backend - Ciclo 7");
    });

    it("should have API description", () => {
      expect(spec.info.description).toContain("Eduardo Álvarez");
    });

    it("should have version information", () => {
      expect(spec.info.version).toBeDefined();
      expect(typeof spec.info.version).toBe("string");
    });

    it("should have server configuration", () => {
      expect(spec.servers).toBeDefined();
      expect(Array.isArray(spec.servers)).toBe(true);
      expect(spec.servers.length).toBeGreaterThan(0);
    });

    it("should have bearerAuth security scheme", () => {
      expect(spec.components).toBeDefined();
      expect(spec.components.securitySchemes).toBeDefined();
      expect(spec.components.securitySchemes.bearerAuth).toBeDefined();
      expect(spec.components.securitySchemes.bearerAuth.type).toBe("http");
      expect(spec.components.securitySchemes.bearerAuth.scheme).toBe("bearer");
    });

    it("should have schema definitions", () => {
      expect(spec.components.schemas).toBeDefined();
      expect(spec.components.schemas.RegisterRequest).toBeDefined();
      expect(spec.components.schemas.LoginRequest).toBeDefined();
      expect(spec.components.schemas.UserResponse).toBeDefined();
      expect(spec.components.schemas.ProductResponse).toBeDefined();
    });

    it("should have error schema definitions", () => {
      expect(spec.components.schemas.Error).toBeDefined();
      expect(spec.components.schemas.ValidationError).toBeDefined();
      expect(spec.components.schemas.UnauthorizedError).toBeDefined();
      expect(spec.components.schemas.NotFoundError).toBeDefined();
    });
  });

  describe("Swagger UI Endpoint", () => {
    it("should serve Swagger UI at /api-docs", async () => {
      const response = await request(app).get("/api-docs/");

      // Swagger UI redirects, so we check for redirect or HTML
      expect([200, 301, 302]).toContain(response.status);
    });

    it("should serve Swagger JSON at /api-docs.json", async () => {
      const response = await request(app).get("/api-docs.json");

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("application/json");
    });

    it("should return valid OpenAPI JSON structure", async () => {
      const response = await request(app).get("/api-docs.json");

      expect(response.body).toBeDefined();
      expect(response.body.openapi).toBe("3.0.0");
      expect(response.body.info).toBeDefined();
      expect(response.body.components).toBeDefined();
    });
  });

  describe("Swagger Schema Validation", () => {
    it("should have required fields in RegisterRequest schema", () => {
      const schema = spec.components.schemas.RegisterRequest;
      expect(schema.required).toContain("email");
      expect(schema.required).toContain("password");
      expect(schema.required).toContain("firstName");
    });

    it("should have required fields in LoginRequest schema", () => {
      const schema = spec.components.schemas.LoginRequest;
      expect(schema.required).toContain("email");
      expect(schema.required).toContain("password");
    });

    it("should have required fields in CreateProductRequest schema", () => {
      const schema = spec.components.schemas.CreateProductRequest;
      expect(schema.required).toContain("name");
      expect(schema.required).toContain("price");
      expect(schema.required).toContain("stock");
      expect(schema.required).toContain("category");
    });

    it("should have proper property types in UserResponse schema", () => {
      const schema = spec.components.schemas.UserResponse;
      expect(schema.properties.id.type).toBe("string");
      expect(schema.properties.email.type).toBe("string");
      expect(schema.properties.isActive.type).toBe("boolean");
    });

    it("should have proper property types in ProductResponse schema", () => {
      const schema = spec.components.schemas.ProductResponse;
      expect(schema.properties.id.type).toBe("string");
      expect(schema.properties.name.type).toBe("string");
      expect(schema.properties.price.type).toBe("number");
      expect(schema.properties.stock.type).toBe("integer");
      expect(schema.properties.isActive.type).toBe("boolean");
    });
  });
});
