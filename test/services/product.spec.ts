/**
 * Product Service Tests
 * Tests for product CRUD operations
 */

import { Role } from "@prisma/client";

// Import after mocking
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  permanentlyDeleteProduct,
  updateProduct,
} from "../../src/services/product";

// Mock prisma before importing services
const mockPrismaUser = {
  findUnique: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockPrismaProduct = {
  findUnique: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

jest.mock("../../src/utils/prisma", () => ({
  prisma: {
    get user() {
      return mockPrismaUser;
    },
    get product() {
      return mockPrismaProduct;
    },
  },
  connectDB: jest.fn(),
  disconnectDB: jest.fn(),
}));

describe("Product Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockProduct = {
    id: "product-123",
    name: "Test Product",
    description: "Test Description",
    price: 99.99,
    stock: 10,
    category: "Electronics",
    image: "https://example.com/image.jpg",
    isActive: true,
    userId: "user-123",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe("createProduct", () => {
    const validProductData = {
      name: "Test Product",
      description: "Test Description",
      price: 99.99,
      stock: 10,
      category: "Electronics",
      image: "https://example.com/image.jpg",
    };

    it("should create a product successfully", async () => {
      mockPrismaProduct.create.mockResolvedValue(mockProduct);

      const result = await createProduct(validProductData, "user-123");

      expect(result).toEqual(mockProduct);
      expect(mockPrismaProduct.create).toHaveBeenCalledWith({
        data: {
          ...validProductData,
          userId: "user-123",
        },
      });
    });

    it("should throw error for negative price", async () => {
      const invalidData = {
        ...validProductData,
        price: -10,
      };

      await expect(createProduct(invalidData, "user-123")).rejects.toThrow(
        "El precio no puede ser negativo"
      );
    });

    it("should throw error for negative stock", async () => {
      const invalidData = {
        ...validProductData,
        stock: -5,
      };

      await expect(createProduct(invalidData, "user-123")).rejects.toThrow(
        "El stock no puede ser negativo"
      );
    });

    it("should create product with zero stock", async () => {
      const zeroStockData = {
        ...validProductData,
        stock: 0,
      };

      const zeroStockProduct = { ...mockProduct, stock: 0 };
      mockPrismaProduct.create.mockResolvedValue(zeroStockProduct);

      const result = await createProduct(zeroStockData, "user-123");

      expect(result.stock).toBe(0);
    });
  });

  describe("getAllProducts", () => {
    it("should get all products without filters", async () => {
      const mockProducts = [mockProduct];
      mockPrismaProduct.findMany.mockResolvedValue(mockProducts);

      const result = await getAllProducts();

      expect(result).toEqual(mockProducts);
      expect(mockPrismaProduct.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: "desc" },
      });
    });

    it("should filter products by category", async () => {
      const mockProducts = [mockProduct];
      mockPrismaProduct.findMany.mockResolvedValue(mockProducts);

      const result = await getAllProducts({ category: "Electronics" });

      expect(result).toEqual(mockProducts);
      expect(mockPrismaProduct.findMany).toHaveBeenCalledWith({
        where: { category: "Electronics" },
        orderBy: { createdAt: "desc" },
      });
    });

    it("should filter products by price range", async () => {
      const mockProducts = [mockProduct];
      mockPrismaProduct.findMany.mockResolvedValue(mockProducts);

      const result = await getAllProducts({ minPrice: 50, maxPrice: 150 });

      expect(result).toEqual(mockProducts);
      expect(mockPrismaProduct.findMany).toHaveBeenCalledWith({
        where: {
          price: {
            gte: 50,
            lte: 150,
          },
        },
        orderBy: { createdAt: "desc" },
      });
    });

    it("should filter products by isActive status", async () => {
      const mockProducts = [mockProduct];
      mockPrismaProduct.findMany.mockResolvedValue(mockProducts);

      const result = await getAllProducts({ isActive: true });

      expect(result).toEqual(mockProducts);
      expect(mockPrismaProduct.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      });
    });

    it("should filter products by userId", async () => {
      const mockProducts = [mockProduct];
      mockPrismaProduct.findMany.mockResolvedValue(mockProducts);

      const result = await getAllProducts({ userId: "user-123" });

      expect(result).toEqual(mockProducts);
      expect(mockPrismaProduct.findMany).toHaveBeenCalledWith({
        where: { userId: "user-123" },
        orderBy: { createdAt: "desc" },
      });
    });
  });

  describe("getProductById", () => {
    it("should get a product by id", async () => {
      mockPrismaProduct.findUnique.mockResolvedValue(mockProduct);

      const result = await getProductById("product-123");

      expect(result).toEqual(mockProduct);
      expect(mockPrismaProduct.findUnique).toHaveBeenCalledWith({
        where: { id: "product-123" },
      });
    });

    it("should throw error when product not found", async () => {
      mockPrismaProduct.findUnique.mockResolvedValue(null);

      await expect(getProductById("non-existent-id")).rejects.toThrow(
        "Producto no encontrado"
      );
    });
  });

  describe("updateProduct", () => {
    const updateData = {
      name: "Updated Product",
      price: 149.99,
    };

    it("should update product as owner", async () => {
      const updatedProduct = { ...mockProduct, ...updateData };

      mockPrismaProduct.findUnique.mockResolvedValue(mockProduct);
      mockPrismaProduct.update.mockResolvedValue(updatedProduct);

      const result = await updateProduct(
        "product-123",
        updateData,
        "user-123",
        Role.USER
      );

      expect(result).toEqual(updatedProduct);
      expect(mockPrismaProduct.update).toHaveBeenCalled();
    });

    it("should update product as admin", async () => {
      const updatedProduct = { ...mockProduct, ...updateData };

      mockPrismaProduct.findUnique.mockResolvedValue(mockProduct);
      mockPrismaProduct.update.mockResolvedValue(updatedProduct);

      const result = await updateProduct(
        "product-123",
        updateData,
        "different-user",
        Role.ADMIN
      );

      expect(result).toEqual(updatedProduct);
    });

    it("should throw error when product not found", async () => {
      mockPrismaProduct.findUnique.mockResolvedValue(null);

      await expect(
        updateProduct("non-existent-id", updateData, "user-123", Role.USER)
      ).rejects.toThrow("Producto no encontrado");
    });

    it("should throw error when user is not owner or admin", async () => {
      mockPrismaProduct.findUnique.mockResolvedValue(mockProduct);

      await expect(
        updateProduct("product-123", updateData, "different-user", Role.USER)
      ).rejects.toThrow("No tienes permisos para actualizar este producto");
    });

    it("should throw error for negative price update", async () => {
      mockPrismaProduct.findUnique.mockResolvedValue(mockProduct);

      await expect(
        updateProduct("product-123", { price: -10 }, "user-123", Role.USER)
      ).rejects.toThrow("El precio no puede ser negativo");
    });

    it("should throw error for negative stock update", async () => {
      mockPrismaProduct.findUnique.mockResolvedValue(mockProduct);

      await expect(
        updateProduct("product-123", { stock: -5 }, "user-123", Role.USER)
      ).rejects.toThrow("El stock no puede ser negativo");
    });
  });

  describe("deleteProduct", () => {
    it("should soft delete product as owner", async () => {
      mockPrismaProduct.findUnique.mockResolvedValue(mockProduct);
      mockPrismaProduct.update.mockResolvedValue({
        ...mockProduct,
        isActive: false,
      });

      await deleteProduct("product-123", "user-123", Role.USER);

      expect(mockPrismaProduct.update).toHaveBeenCalledWith({
        where: { id: "product-123" },
        data: { isActive: false },
      });
    });

    it("should soft delete product as admin", async () => {
      mockPrismaProduct.findUnique.mockResolvedValue(mockProduct);
      mockPrismaProduct.update.mockResolvedValue({
        ...mockProduct,
        isActive: false,
      });

      await deleteProduct("product-123", "different-user", Role.ADMIN);

      expect(mockPrismaProduct.update).toHaveBeenCalled();
    });

    it("should throw error when product not found", async () => {
      mockPrismaProduct.findUnique.mockResolvedValue(null);

      await expect(
        deleteProduct("non-existent-id", "user-123", Role.USER)
      ).rejects.toThrow("Producto no encontrado");
    });

    it("should throw error when user is not owner or admin", async () => {
      mockPrismaProduct.findUnique.mockResolvedValue(mockProduct);

      await expect(
        deleteProduct("product-123", "different-user", Role.USER)
      ).rejects.toThrow("No tienes permisos para eliminar este producto");
    });
  });

  describe("permanentlyDeleteProduct", () => {
    it("should permanently delete product", async () => {
      mockPrismaProduct.findUnique.mockResolvedValue(mockProduct);
      mockPrismaProduct.delete.mockResolvedValue(mockProduct);

      await permanentlyDeleteProduct("product-123");

      expect(mockPrismaProduct.delete).toHaveBeenCalledWith({
        where: { id: "product-123" },
      });
    });

    it("should throw error when product not found", async () => {
      mockPrismaProduct.findUnique.mockResolvedValue(null);

      await expect(permanentlyDeleteProduct("non-existent-id")).rejects.toThrow(
        "Producto no encontrado"
      );
    });
  });
});
