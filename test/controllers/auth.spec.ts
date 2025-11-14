/**
 * Authentication Controller Tests
 * Integration tests for authentication endpoints
 */

import { Role } from "@prisma/client";
import request from "supertest";

import app from "../../src/app";
import { hashPassword } from "../../src/utils/password";
import { mockPrismaUser } from "../__mocks__/prisma";

// Mock the prisma module
jest.mock("../../src/utils/prisma");

describe("Auth Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/v1/auth/register", () => {
    const validRegistrationData = {
      email: "newuser@example.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
    };

    it("should register a new user successfully", async () => {
      const mockUser = {
        id: "new-user-id",
        email: validRegistrationData.email,
        password: await hashPassword(validRegistrationData.password),
        firstName: validRegistrationData.firstName,
        lastName: validRegistrationData.lastName,
        role: Role.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaUser.findUnique.mockResolvedValue(null);
      mockPrismaUser.create.mockResolvedValue(mockUser);

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(validRegistrationData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Usuario registrado exitosamente");
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(validRegistrationData.email);
    });

    it("should return 400 for invalid email", async () => {
      const invalidData = {
        ...validRegistrationData,
        email: "invalid-email",
      };

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("email");
    });

    it("should return 400 for short password", async () => {
      const invalidData = {
        ...validRegistrationData,
        password: "12345",
      };

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("contraseña");
    });

    it("should return 400 when email already exists", async () => {
      mockPrismaUser.findUnique.mockResolvedValue({
        id: "existing-user",
        email: validRegistrationData.email,
      });

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(validRegistrationData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("email ya está registrado");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    const validLoginData = {
      email: "user@example.com",
      password: "password123",
    };

    it("should login successfully with valid credentials", async () => {
      const mockUser = {
        id: "user-123",
        email: validLoginData.email,
        password: await hashPassword(validLoginData.password),
        firstName: "John",
        lastName: "Doe",
        role: Role.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaUser.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send(validLoginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Login exitoso");
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(validLoginData.email);
    });

    it("should return 401 for invalid credentials", async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send(validLoginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Credenciales inválidas");
    });

    it("should return 401 for inactive user", async () => {
      const mockUser = {
        id: "user-123",
        email: validLoginData.email,
        password: await hashPassword(validLoginData.password),
        firstName: "John",
        lastName: "Doe",
        role: Role.USER,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaUser.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send(validLoginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Usuario inactivo");
    });

    it("should return 401 for wrong password", async () => {
      const mockUser = {
        id: "user-123",
        email: validLoginData.email,
        password: await hashPassword("differentPassword"),
        firstName: "John",
        lastName: "Doe",
        role: Role.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaUser.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send(validLoginData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/v1/auth/profile", () => {
    it("should return user profile with valid token", async () => {
      const mockUser = {
        id: "user-123",
        email: "user@example.com",
        password: await hashPassword("password123"),
        firstName: "John",
        lastName: "Doe",
        role: Role.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock for login
      mockPrismaUser.findUnique.mockResolvedValue(mockUser);

      // First login to get token
      const loginResponse = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "user@example.com", password: "password123" });

      const token = loginResponse.body.data.token;

      // Now get profile
      const response = await request(app)
        .get("/api/v1/auth/profile")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe("user-123");
      expect(response.body.data.email).toBe("user@example.com");
    });

    it("should return 401 without token", async () => {
      const response = await request(app)
        .get("/api/v1/auth/profile")
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Token");
    });

    it("should return 401 with invalid token", async () => {
      const response = await request(app)
        .get("/api/v1/auth/profile")
        .set("Authorization", "Bearer invalid.token.here")
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should return 500 when database error occurs", async () => {
      const mockUser = {
        id: "user-123",
        email: "user@example.com",
        password: await hashPassword("password123"),
        firstName: "John",
        lastName: "Doe",
        role: Role.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock for login - successful
      mockPrismaUser.findUnique
        .mockResolvedValueOnce(mockUser) // For login
        .mockRejectedValueOnce(new Error("Database error")); // For profile

      // First login to get token
      const loginResponse = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "user@example.com", password: "password123" });

      const token = loginResponse.body.data.token;

      // Now get profile - should fail
      const response = await request(app)
        .get("/api/v1/auth/profile")
        .set("Authorization", `Bearer ${token}`)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Database error");
    });
  });
});
