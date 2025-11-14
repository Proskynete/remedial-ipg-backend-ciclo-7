/**
 * Health Check Tests
 * Tests for the health check endpoint
 */

import request from "supertest";

import app from "../../src/app";

describe("Health Check", () => {
  describe("GET /health", () => {
    it("should return 200 status code", async () => {
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
    });

    it("should return empty response body", async () => {
      const response = await request(app).get("/health");

      expect(response.text).toBe("");
    });

    it("should respond quickly (performance check)", async () => {
      const startTime = Date.now();
      await request(app).get("/health");
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Health check should respond in less than 100ms
      expect(responseTime).toBeLessThan(100);
    });
  });
});
