/**
 * JWT Utilities
 * Functions for generating and verifying JWT tokens
 */

import jwt from "jsonwebtoken";

import { config } from "../config";
import { JwtPayload } from "../models/business/auth";

/**
 * Generates a JWT token for a user
 * @param payload - The data to encode in the token (userId, email, role)
 * @returns The generated JWT token string
 */
export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expire,
  } as any);
};

/**
 * Verifies and decodes a JWT token
 * @param token - The JWT token to verify
 * @returns The decoded payload if valid
 * @throws Error if token is invalid or expired
 */
export const verifyToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token expirado");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Token inválido");
    }
    throw new Error("Error al verificar token");
  }
};

/**
 * Extracts token from Authorization header
 * @param authHeader - The Authorization header value (e.g., "Bearer token123")
 * @returns The token string or null if invalid format
 */
export const extractTokenFromHeader = (
  authHeader: string | undefined
): string | null => {
  if (!authHeader) {
    return null;
  }

  // Check if header follows "Bearer token" format
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
};
