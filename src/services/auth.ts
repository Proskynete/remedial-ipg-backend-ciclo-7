/**
 * Authentication Service
 * Business logic for user registration and login
 */

import { Role } from "@prisma/client";

import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserResponse,
} from "../models/business/auth";
import { generateToken } from "../utils/jwt";
import {
  comparePassword,
  hashPassword,
  validatePassword,
} from "../utils/password";
import { prisma } from "../utils/prisma";

/**
 * Registers a new user in the system
 * @param data - User registration data
 * @returns Authentication response with token and user data
 * @throws Error if email already exists or validation fails
 */
export const registerUser = async (
  data: RegisterRequest
): Promise<AuthResponse> => {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    throw new Error("Formato de email inválido");
  }

  // Validate password strength
  if (!validatePassword(data.password)) {
    throw new Error("La contraseña debe tener al menos 6 caracteres");
  }

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("El email ya está registrado");
  }

  // Hash password
  const hashedPassword = await hashPassword(data.password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || Role.USER,
    },
  });

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Return response without password
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
    },
  };
};

/**
 * Authenticates a user with email and password
 * @param data - Login credentials
 * @returns Authentication response with token and user data
 * @throws Error if credentials are invalid
 */
export const loginUser = async (data: LoginRequest): Promise<AuthResponse> => {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new Error("Credenciales inválidas");
  }

  // Check if user is active
  if (!user.isActive) {
    throw new Error("Usuario inactivo. Contacte al administrador");
  }

  // Verify password
  const isPasswordValid = await comparePassword(data.password, user.password);

  if (!isPasswordValid) {
    throw new Error("Credenciales inválidas");
  }

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Return response without password
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
    },
  };
};

/**
 * Gets user profile by ID
 * @param userId - The user ID
 * @returns User data without password
 * @throws Error if user not found
 */
export const getUserProfile = async (userId: string): Promise<UserResponse> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  // Return user without password
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
