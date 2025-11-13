/**
 * Product Controller
 * Handles HTTP requests for product endpoints
 */

import { Request, Response } from "express";

import { AuthenticatedRequest } from "../middleware/auth";
import {
  CreateProductRequest,
  ProductFilters,
  UpdateProductRequest,
} from "../models/business/product";
import { EStatusCode } from "../models/status_code";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  permanentlyDeleteProduct,
  updateProduct,
} from "../services/product";

/**
 * Create a new product
 * @route POST /api/v1/products
 * @access Private (requires authentication)
 */
export const create = async (
  req: Request<unknown, unknown, CreateProductRequest>,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).userId;

    if (!userId) {
      res.status(EStatusCode.UNAUTHORIZED).json({
        success: false,
        message: "No autenticado",
      });
      return;
    }

    const product = await createProduct(req.body, userId);

    res.status(EStatusCode.CREATED).json({
      success: true,
      message: "Producto creado exitosamente",
      data: product,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error al crear producto";

    res.status(EStatusCode.BAD_REQUEST).json({
      success: false,
      message: errorMessage,
    });
  }
};

/**
 * Get all products with optional filters
 * @route GET /api/v1/products
 * @access Public
 */
export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    // Parse query parameters for filters
    const filters: ProductFilters = {
      category: req.query.category as string | undefined,
      minPrice: req.query.minPrice
        ? parseFloat(req.query.minPrice as string)
        : undefined,
      maxPrice: req.query.maxPrice
        ? parseFloat(req.query.maxPrice as string)
        : undefined,
      isActive:
        req.query.isActive !== undefined
          ? req.query.isActive === "true"
          : undefined,
      userId: req.query.userId as string | undefined,
    };

    const products = await getAllProducts(filters);

    res.status(EStatusCode.OK).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error al obtener productos";

    res.status(EStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: errorMessage,
    });
  }
};

/**
 * Get a single product by ID
 * @route GET /api/v1/products/:id
 * @access Public
 */
export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await getProductById(id);

    res.status(EStatusCode.OK).json({
      success: true,
      data: product,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error al obtener producto";

    const statusCode =
      error instanceof Error && error.message === "Producto no encontrado"
        ? EStatusCode.NOT_FOUND
        : EStatusCode.INTERNAL_SERVER_ERROR;

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
    });
  }
};

/**
 * Update a product
 * @route PUT /api/v1/products/:id
 * @access Private (requires authentication, owner or admin)
 */
export const update = async (
  req: Request<{ id: string }, unknown, UpdateProductRequest>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).userId;
    const userRole = (req as AuthenticatedRequest).userRole;

    if (!userId || !userRole) {
      res.status(EStatusCode.UNAUTHORIZED).json({
        success: false,
        message: "No autenticado",
      });
      return;
    }

    const product = await updateProduct(id, req.body, userId, userRole);

    res.status(EStatusCode.OK).json({
      success: true,
      message: "Producto actualizado exitosamente",
      data: product,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error al actualizar producto";

    let statusCode = EStatusCode.INTERNAL_SERVER_ERROR;
    if (error instanceof Error) {
      if (error.message === "Producto no encontrado") {
        statusCode = EStatusCode.NOT_FOUND;
      } else if (
        error.message === "No tienes permisos para actualizar este producto"
      ) {
        statusCode = EStatusCode.FORBIDDEN;
      } else if (
        error.message.includes("precio") ||
        error.message.includes("stock")
      ) {
        statusCode = EStatusCode.BAD_REQUEST;
      }
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
    });
  }
};

/**
 * Delete a product (soft delete)
 * @route DELETE /api/v1/products/:id
 * @access Private (requires authentication, owner or admin)
 */
export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).userId;
    const userRole = (req as AuthenticatedRequest).userRole;

    if (!userId || !userRole) {
      res.status(EStatusCode.UNAUTHORIZED).json({
        success: false,
        message: "No autenticado",
      });
      return;
    }

    await deleteProduct(id, userId, userRole);

    res.status(EStatusCode.OK).json({
      success: true,
      message: "Producto eliminado exitosamente",
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error al eliminar producto";

    let statusCode = EStatusCode.INTERNAL_SERVER_ERROR;
    if (error instanceof Error) {
      if (error.message === "Producto no encontrado") {
        statusCode = EStatusCode.NOT_FOUND;
      } else if (
        error.message === "No tienes permisos para eliminar este producto"
      ) {
        statusCode = EStatusCode.FORBIDDEN;
      }
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
    });
  }
};

/**
 * Permanently delete a product (hard delete)
 * @route DELETE /api/v1/products/:id/permanent
 * @access Private (requires admin role)
 */
export const permanentRemove = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    await permanentlyDeleteProduct(id);

    res.status(EStatusCode.OK).json({
      success: true,
      message: "Producto eliminado permanentemente",
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Error al eliminar producto permanentemente";

    const statusCode =
      error instanceof Error && error.message === "Producto no encontrado"
        ? EStatusCode.NOT_FOUND
        : EStatusCode.INTERNAL_SERVER_ERROR;

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
    });
  }
};
