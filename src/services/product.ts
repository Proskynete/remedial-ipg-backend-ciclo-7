/**
 * Product Service
 * Business logic for product CRUD operations
 */

import {
  CreateProductRequest,
  ProductFilters,
  ProductResponse,
  UpdateProductRequest,
} from "../models/business/product";
import { prisma } from "../utils/prisma";

/**
 * Creates a new product
 * @param data - Product creation data
 * @param userId - ID of the user creating the product
 * @returns The created product
 */
export const createProduct = async (
  data: CreateProductRequest,
  userId: string
): Promise<ProductResponse> => {
  // Validate price and stock
  if (data.price < 0) {
    throw new Error("El precio no puede ser negativo");
  }

  if (data.stock < 0) {
    throw new Error("El stock no puede ser negativo");
  }

  const product = await prisma.product.create({
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock,
      category: data.category,
      image: data.image,
      userId: userId,
    },
  });

  return product;
};

/**
 * Gets all products with optional filters
 * @param filters - Optional filters for products
 * @returns Array of products
 */
export const getAllProducts = async (
  filters?: ProductFilters
): Promise<ProductResponse[]> => {
  const where: any = {};

  // Apply filters
  if (filters?.category) {
    where.category = filters.category;
  }

  if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) {
      where.price.gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      where.price.lte = filters.maxPrice;
    }
  }

  if (filters?.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  if (filters?.userId) {
    where.userId = filters.userId;
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
  });

  return products;
};

/**
 * Gets a single product by ID
 * @param productId - The product ID
 * @returns The product
 * @throws Error if product not found
 */
export const getProductById = async (
  productId: string
): Promise<ProductResponse> => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error("Producto no encontrado");
  }

  return product;
};

/**
 * Updates a product
 * @param productId - The product ID
 * @param data - Product update data
 * @param userId - ID of the user updating the product
 * @param userRole - Role of the user (for authorization)
 * @returns The updated product
 * @throws Error if product not found or user not authorized
 */
export const updateProduct = async (
  productId: string,
  data: UpdateProductRequest,
  userId: string,
  userRole: string
): Promise<ProductResponse> => {
  // Check if product exists
  const existingProduct = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!existingProduct) {
    throw new Error("Producto no encontrado");
  }

  // Check authorization: only owner or admin can update
  if (existingProduct.userId !== userId && userRole !== "ADMIN") {
    throw new Error("No tienes permisos para actualizar este producto");
  }

  // Validate price and stock if provided
  if (data.price !== undefined && data.price < 0) {
    throw new Error("El precio no puede ser negativo");
  }

  if (data.stock !== undefined && data.stock < 0) {
    throw new Error("El stock no puede ser negativo");
  }

  const updatedProduct = await prisma.product.update({
    where: { id: productId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.stock !== undefined && { stock: data.stock }),
      ...(data.category && { category: data.category }),
      ...(data.image !== undefined && { image: data.image }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });

  return updatedProduct;
};

/**
 * Deletes a product (soft delete by setting isActive to false)
 * @param productId - The product ID
 * @param userId - ID of the user deleting the product
 * @param userRole - Role of the user (for authorization)
 * @throws Error if product not found or user not authorized
 */
export const deleteProduct = async (
  productId: string,
  userId: string,
  userRole: string
): Promise<void> => {
  // Check if product exists
  const existingProduct = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!existingProduct) {
    throw new Error("Producto no encontrado");
  }

  // Check authorization: only owner or admin can delete
  if (existingProduct.userId !== userId && userRole !== "ADMIN") {
    throw new Error("No tienes permisos para eliminar este producto");
  }

  // Soft delete: set isActive to false
  await prisma.product.update({
    where: { id: productId },
    data: { isActive: false },
  });
};

/**
 * Permanently deletes a product (hard delete)
 * Only for admins
 * @param productId - The product ID
 * @throws Error if product not found
 */
export const permanentlyDeleteProduct = async (
  productId: string
): Promise<void> => {
  // Check if product exists
  const existingProduct = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!existingProduct) {
    throw new Error("Producto no encontrado");
  }

  // Hard delete
  await prisma.product.delete({
    where: { id: productId },
  });
};
