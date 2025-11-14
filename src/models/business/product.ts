/**
 * Product Models and Interfaces
 * Defines types for product requests and responses
 */

/**
 * Product creation request interface
 * Contains all required fields for creating a new product
 */
export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
}

/**
 * Product update request interface
 * All fields are optional to allow partial updates
 */
export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
  image?: string;
  isActive?: boolean;
}

/**
 * Product response interface
 * Represents complete product data
 */
export interface ProductResponse {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  category: string;
  image?: string | null;
  isActive: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Product query filters interface
 * Used for filtering products in GET requests
 */
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  userId?: string;
}
