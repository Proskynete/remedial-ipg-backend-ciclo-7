/**
 * Authentication Models and Interfaces
 * Defines types for authentication requests and responses
 */

import { Role } from "@prisma/client";

/**
 * User registration request interface
 * Contains all required fields for creating a new user account
 */
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  role?: Role;
}

/**
 * User login request interface
 * Contains credentials for user authentication
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Authentication response interface
 * Contains JWT token and user information after successful authentication
 */
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName?: string | null;
    role: Role;
    isActive: boolean;
  };
}

/**
 * JWT Payload interface
 * Contains data stored in the JWT token
 */
export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

/**
 * User response interface
 * Represents user data without sensitive information
 */
export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName?: string | null;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
