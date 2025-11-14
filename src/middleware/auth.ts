/**
 * Authentication Middleware
 * Verifies JWT token and attaches user information to request
 */

import { NextFunction, Request, Response } from "express";

import { EStatusCode } from "../models/status_code";
import { extractTokenFromHeader, verifyToken } from "../utils/jwt";

/**
 * Extended Request interface to include user authentication data
 */
export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
  userRole?: string;
}

/**
 * Middleware to authenticate requests using JWT
 * Verifies the token from Authorization header and attaches user data to request
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      res.status(EStatusCode.UNAUTHORIZED).json({
        success: false,
        message: "Token de autenticación no proporcionado",
      });
      return;
    }

    // Verify and decode token
    const decoded = verifyToken(token);

    // Attach user information to request
    (req as AuthenticatedRequest).userId = decoded.userId;
    (req as AuthenticatedRequest).userEmail = decoded.email;
    (req as AuthenticatedRequest).userRole = decoded.role;

    next();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Token inválido";

    res.status(EStatusCode.UNAUTHORIZED).json({
      success: false,
      message: errorMessage,
    });
  }
};

/**
 * Middleware to check if user has required role(s)
 * Must be used after authenticate middleware
 * @param allowedRoles - Array of roles that are allowed to access the route
 * @returns Express middleware function
 *
 * @example
 * // Only ADMIN can access
 * router.delete('/users/:id', authenticate, authorize(['ADMIN']), deleteUser);
 *
 * @example
 * // ADMIN and MODERATOR can access
 * router.put('/products/:id', authenticate, authorize(['ADMIN', 'MODERATOR']), updateProduct);
 */
export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = (req as AuthenticatedRequest).userRole;

    if (!userRole) {
      res.status(EStatusCode.UNAUTHORIZED).json({
        success: false,
        message: "No autenticado",
      });
      return;
    }

    if (!allowedRoles.includes(userRole)) {
      res.status(EStatusCode.FORBIDDEN).json({
        success: false,
        message: "No tienes permisos para realizar esta acción",
      });
      return;
    }

    next();
  };
};
