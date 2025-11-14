/**
 * Password Utility Tests
 * Tests for password hashing and validation functions
 */

import {
  comparePassword,
  hashPassword,
  validatePassword,
} from "../../src/utils/password";

describe("Password Utils", () => {
  describe("hashPassword", () => {
    it("should hash a password successfully", async () => {
      const password = "password123";
      const hashed = await hashPassword(password);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(0);
    });

    it("should generate different hashes for the same password", async () => {
      const password = "password123";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it("should hash different passwords differently", async () => {
      const hash1 = await hashPassword("password123");
      const hash2 = await hashPassword("differentPassword");

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("comparePassword", () => {
    it("should return true for matching password", async () => {
      const password = "password123";
      const hashed = await hashPassword(password);
      const isMatch = await comparePassword(password, hashed);

      expect(isMatch).toBe(true);
    });

    it("should return false for non-matching password", async () => {
      const password = "password123";
      const wrongPassword = "wrongPassword";
      const hashed = await hashPassword(password);
      const isMatch = await comparePassword(wrongPassword, hashed);

      expect(isMatch).toBe(false);
    });

    it("should handle empty passwords", async () => {
      const hashed = await hashPassword("");
      const isMatch = await comparePassword("", hashed);

      expect(isMatch).toBe(true);
    });
  });

  describe("validatePassword", () => {
    it("should return true for valid password (>= 6 chars)", () => {
      expect(validatePassword("123456")).toBe(true);
      expect(validatePassword("password123")).toBe(true);
      expect(validatePassword("abcdefghijklmnop")).toBe(true);
    });

    it("should return false for invalid password (< 6 chars)", () => {
      expect(validatePassword("12345")).toBe(false);
      expect(validatePassword("abc")).toBe(false);
      expect(validatePassword("1")).toBe(false);
      expect(validatePassword("")).toBe(false);
    });

    it("should handle edge case of exactly 6 characters", () => {
      expect(validatePassword("123456")).toBe(true);
    });
  });
});
