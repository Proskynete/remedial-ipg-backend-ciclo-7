/**
 * Authentication Controller
 * Handles HTTP requests for authentication endpoints
 */

import { Request, Response } from "express";

import { LoginRequest, RegisterRequest } from "../models/business/auth";
import { EStatusCode } from "../models/status_code";
import { getUserProfile, loginUser, registerUser } from "../services/auth";

/**
 * Register a new user
 * @route POST /api/v1/auth/register
 * @access Public
 */
export const register = async (
  req: Request<unknown, unknown, RegisterRequest>,
  res: Response
): Promise<void> => {
  try {
    const result = await registerUser(req.body);

    res.status(EStatusCode.CREATED).json({
      success: true,
      message: "Usuario registrado exitosamente",
      data: result,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error al registrar usuario";

    res.status(EStatusCode.BAD_REQUEST).json({
      success: false,
      message: errorMessage,
    });
  }
};

/**
 * Login user
 * @route POST /api/v1/auth/login
 * @access Public
 */
export const login = async (
  req: Request<unknown, unknown, LoginRequest>,
  res: Response
): Promise<void> => {
  try {
    const result = await loginUser(req.body);

    res.status(EStatusCode.OK).json({
      success: true,
      message: "Login exitoso",
      data: result,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error al iniciar sesión";

    res.status(EStatusCode.UNAUTHORIZED).json({
      success: false,
      message: errorMessage,
    });
  }
};

/**
 * Get current user profile
 * @route GET /api/v1/auth/profile
 * @access Private (requires authentication)
 */
export const getProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // userId is set by authentication middleware
    const userId = (req as any).userId;

    if (!userId) {
      res.status(EStatusCode.UNAUTHORIZED).json({
        success: false,
        message: "No autenticado",
      });
      return;
    }

    const user = await getUserProfile(userId);

    res.status(EStatusCode.OK).json({
      success: true,
      data: user,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error al obtener perfil";

    res.status(EStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: errorMessage,
    });
  }
};
