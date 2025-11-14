/**
 * Authentication Service Tests
 * Tests for user registration, login, and profile retrieval
 */

import { Role } from "@prisma/client";

import {
  getUserProfile,
  loginUser,
  registerUser,
} from "../../src/services/auth";
import { hashPassword } from "../../src/utils/password";

// Mock prisma before importing services
const mockPrismaUser = {
  findUnique: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

jest.mock("../../src/utils/prisma", () => ({
  prisma: {
    user: mockPrismaUser,
    product: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
  connectDB: jest.fn(),
  disconnectDB: jest.fn(),
}));

describe("Auth Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    const validRegistrationData = {
      email: "test@example.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
    };

    it("should register a new user successfully", async () => {
      const mockUser = {
        id: "123",
        email: validRegistrationData.email,
        password: "hashedPassword",
        firstName: validRegistrationData.firstName,
        lastName: validRegistrationData.lastName,
        role: Role.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaUser.findUnique.mockResolvedValue(null);
      mockPrismaUser.create.mockResolvedValue(mockUser);

      const result = await registerUser(validRegistrationData);

      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user.email).toBe(validRegistrationData.email);
      expect(result.user.firstName).toBe(validRegistrationData.firstName);
      expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
        where: { email: validRegistrationData.email },
      });
      expect(mockPrismaUser.create).toHaveBeenCalled();
    });

    it("should throw error for invalid email format", async () => {
      const invalidData = {
        ...validRegistrationData,
        email: "invalid-email",
      };

      await expect(registerUser(invalidData)).rejects.toThrow(
        "Formato de email inválido"
      );
    });

    it("should throw error for short password", async () => {
      const invalidData = {
        ...validRegistrationData,
        password: "12345", // Less than 6 characters
      };

      await expect(registerUser(invalidData)).rejects.toThrow(
        "La contraseña debe tener al menos 6 caracteres"
      );
    });

    it("should throw error when email already exists", async () => {
      mockPrismaUser.findUnique.mockResolvedValue({
        id: "existing-user-id",
        email: validRegistrationData.email,
      });

      await expect(registerUser(validRegistrationData)).rejects.toThrow(
        "El email ya está registrado"
      );
    });

    it("should create user with specified role", async () => {
      const adminData = {
        ...validRegistrationData,
        role: Role.ADMIN,
      };

      const mockUser = {
        id: "123",
        email: adminData.email,
        password: "hashedPassword",
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        role: Role.ADMIN,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaUser.findUnique.mockResolvedValue(null);
      mockPrismaUser.create.mockResolvedValue(mockUser);

      const result = await registerUser(adminData);

      expect(result.user.role).toBe(Role.ADMIN);
    });
  });

  describe("loginUser", () => {
    const validLoginData = {
      email: "test@example.com",
      password: "password123",
    };

    it("should login user with valid credentials", async () => {
      const hashedPassword = await hashPassword(validLoginData.password);
      const mockUser = {
        id: "123",
        email: validLoginData.email,
        password: hashedPassword,
        firstName: "John",
        lastName: "Doe",
        role: Role.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaUser.findUnique.mockResolvedValue(mockUser);

      const result = await loginUser(validLoginData);

      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user.email).toBe(validLoginData.email);
      expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
        where: { email: validLoginData.email },
      });
    });

    it("should throw error for non-existent user", async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);

      await expect(loginUser(validLoginData)).rejects.toThrow(
        "Credenciales inválidas"
      );
    });

    it("should throw error for inactive user", async () => {
      const hashedPassword = await hashPassword(validLoginData.password);
      const mockUser = {
        id: "123",
        email: validLoginData.email,
        password: hashedPassword,
        firstName: "John",
        lastName: "Doe",
        role: Role.USER,
        isActive: false, // Inactive user
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaUser.findUnique.mockResolvedValue(mockUser);

      await expect(loginUser(validLoginData)).rejects.toThrow(
        "Usuario inactivo. Contacte al administrador"
      );
    });

    it("should throw error for wrong password", async () => {
      const hashedPassword = await hashPassword("differentPassword");
      const mockUser = {
        id: "123",
        email: validLoginData.email,
        password: hashedPassword,
        firstName: "John",
        lastName: "Doe",
        role: Role.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaUser.findUnique.mockResolvedValue(mockUser);

      await expect(loginUser(validLoginData)).rejects.toThrow(
        "Credenciales inválidas"
      );
    });
  });

  describe("getUserProfile", () => {
    it("should return user profile without password", async () => {
      const mockUser = {
        id: "123",
        email: "test@example.com",
        password: "hashedPassword",
        firstName: "John",
        lastName: "Doe",
        role: Role.USER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaUser.findUnique.mockResolvedValue(mockUser);

      const result = await getUserProfile("123");

      expect(result).toBeDefined();
      expect(result.id).toBe("123");
      expect(result.email).toBe("test@example.com");
      expect(result.firstName).toBe("John");
      expect((result as any).password).toBeUndefined();
      expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
        where: { id: "123" },
      });
    });

    it("should throw error when user not found", async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);

      await expect(getUserProfile("non-existent-id")).rejects.toThrow(
        "Usuario no encontrado"
      );
    });
  });
});
