/**
 * Authentication Middleware Tests
 * Tests for authenticate and authorize middleware
 */

import { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";

import { authenticate, authorize } from "../../src/middleware/auth";
import { generateToken } from "../../src/utils/jwt";

describe("Auth Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockRequest = {
      headers: {},
    };

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    mockNext = jest.fn();
  });

  describe("authenticate", () => {
    it("should authenticate user with valid token", async () => {
      const token = generateToken({
        userId: "user-123",
        email: "test@example.com",
        role: Role.USER,
      });

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      await authenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect((mockRequest as any).userId).toBe("user-123");
      expect((mockRequest as any).userEmail).toBe("test@example.com");
      expect((mockRequest as any).userRole).toBe(Role.USER);
    });

    it("should reject request without authorization header", async () => {
      mockRequest.headers = {};

      await authenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: "Token de autenticación no proporcionado",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject request with invalid token format", async () => {
      mockRequest.headers = {
        authorization: "InvalidToken",
      };

      await authenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: "Token de autenticación no proporcionado",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject request with invalid token", async () => {
      mockRequest.headers = {
        authorization: "Bearer invalid.token.here",
      };

      await authenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: "Token inválido",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle missing Bearer prefix", async () => {
      const token = generateToken({
        userId: "user-123",
        email: "test@example.com",
        role: Role.USER,
      });

      mockRequest.headers = {
        authorization: token, // Missing "Bearer " prefix
      };

      await authenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("authorize", () => {
    beforeEach(() => {
      // Simulate authenticated user
      (mockRequest as any).userId = "user-123";
      (mockRequest as any).userEmail = "test@example.com";
    });

    it("should authorize user with correct role", () => {
      (mockRequest as any).userRole = Role.ADMIN;

      const authorizeMiddleware = authorize([Role.ADMIN]);
      authorizeMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it("should authorize user with one of multiple allowed roles", () => {
      (mockRequest as any).userRole = Role.MODERATOR;

      const authorizeMiddleware = authorize([
        Role.ADMIN,
        Role.MODERATOR,
      ]);
      authorizeMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it("should reject user without role", () => {
      (mockRequest as any).userRole = undefined;

      const authorizeMiddleware = authorize([Role.ADMIN]);
      authorizeMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: "No autenticado",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject user with incorrect role", () => {
      (mockRequest as any).userRole = Role.USER;

      const authorizeMiddleware = authorize([Role.ADMIN]);
      authorizeMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: "No tienes permisos para realizar esta acción",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle empty allowed roles array", () => {
      (mockRequest as any).userRole = Role.USER;

      const authorizeMiddleware = authorize([]);
      authorizeMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
