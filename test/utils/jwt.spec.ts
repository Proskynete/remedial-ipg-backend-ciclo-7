/**
 * JWT Utility Tests
 * Tests for JWT token generation and verification
 */

import { Role } from "@prisma/client";

import { extractTokenFromHeader, generateToken, verifyToken } from "../../src/utils/jwt";

describe("JWT Utils", () => {
  const mockPayload = {
    userId: "123e4567-e89b-12d3-a456-426614174000",
    email: "test@example.com",
    role: Role.USER,
  };

  describe("generateToken", () => {
    it("should generate a valid JWT token", () => {
      const token = generateToken(mockPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT has 3 parts
    });

    it("should generate different tokens for different payloads", () => {
      const token1 = generateToken(mockPayload);
      const token2 = generateToken({
        ...mockPayload,
        userId: "different-id",
      });

      expect(token1).not.toBe(token2);
    });
  });

  describe("verifyToken", () => {
    it("should verify and decode a valid token", () => {
      const token = generateToken(mockPayload);
      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.role).toBe(mockPayload.role);
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    it("should throw error for invalid token", () => {
      const invalidToken = "invalid.token.here";

      expect(() => verifyToken(invalidToken)).toThrow("Token inválido");
    });

    it("should throw error for malformed token", () => {
      const malformedToken = "not-a-token";

      expect(() => verifyToken(malformedToken)).toThrow("Token inválido");
    });

    it("should throw error for empty token", () => {
      expect(() => verifyToken("")).toThrow();
    });
  });

  describe("extractTokenFromHeader", () => {
    it("should extract token from valid Bearer header", () => {
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token";
      const authHeader = `Bearer ${token}`;
      const extracted = extractTokenFromHeader(authHeader);

      expect(extracted).toBe(token);
    });

    it("should return null for missing header", () => {
      const extracted = extractTokenFromHeader(undefined);

      expect(extracted).toBeNull();
    });

    it("should return null for invalid format (no Bearer)", () => {
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token";
      const extracted = extractTokenFromHeader(token);

      expect(extracted).toBeNull();
    });

    it("should return null for invalid format (wrong prefix)", () => {
      const authHeader = "Basic sometoken";
      const extracted = extractTokenFromHeader(authHeader);

      expect(extracted).toBeNull();
    });

    it("should return null for empty string", () => {
      const extracted = extractTokenFromHeader("");

      expect(extracted).toBeNull();
    });

    it("should handle header with extra spaces", () => {
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token";
      const authHeader = `Bearer  ${token}`; // Extra space
      const extracted = extractTokenFromHeader(authHeader);

      // Should return null because format is invalid with extra space
      expect(extracted).toBeNull();
    });
  });
});
