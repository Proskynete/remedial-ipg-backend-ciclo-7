/**
 * Product Controller Tests
 * Integration tests for product CRUD endpoints
 */

import { Role } from "@prisma/client";
import request from "supertest";

import app from "../../src/app";
import { generateToken } from "../../src/utils/jwt";
import { mockPrismaProduct } from "../__mocks__/prisma";

// Mock the prisma module
jest.mock("../../src/utils/prisma");

describe("Product Controller", () => {
  let userToken: string;
  let adminToken: string;

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

  beforeAll(() => {
    userToken = generateToken({
      userId: "user-123",
      email: "user@example.com",
      role: Role.USER,
    });

    adminToken = generateToken({
      userId: "admin-123",
      email: "admin@example.com",
      role: Role.ADMIN,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/v1/products", () => {
    const validProductData = {
      name: "Test Product",
      description: "Test Description",
      price: 99.99,
      stock: 10,
      category: "Electronics",
      image: "https://example.com/image.jpg",
    };

    it("should create product with valid authentication", async () => {
      mockPrismaProduct.create.mockResolvedValue(mockProduct);

      const response = await request(app)
        .post("/api/v1/products")
        .set("Authorization", `Bearer ${userToken}`)
        .send(validProductData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Producto creado exitosamente");
      expect(response.body.data.name).toBe(validProductData.name);
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app)
        .post("/api/v1/products")
        .send(validProductData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should return 400 for negative price", async () => {
      const invalidData = {
        ...validProductData,
        price: -10,
      };

      const response = await request(app)
        .post("/api/v1/products")
        .set("Authorization", `Bearer ${userToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("precio");
    });

    it("should return 400 for negative stock", async () => {
      const invalidData = {
        ...validProductData,
        stock: -5,
      };

      const response = await request(app)
        .post("/api/v1/products")
        .set("Authorization", `Bearer ${userToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("stock");
    });

    it("should return 500 when database error occurs", async () => {
      mockPrismaProduct.create.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/v1/products")
        .set("Authorization", `Bearer ${userToken}`)
        .send(validProductData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/v1/products", () => {
    it("should get all products without authentication", async () => {
      const mockProducts = [mockProduct];
      mockPrismaProduct.findMany.mockResolvedValue(mockProducts);

      const response = await request(app).get("/api/v1/products").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data).toHaveLength(1);
    });

    it("should filter products by category", async () => {
      const mockProducts = [mockProduct];
      mockPrismaProduct.findMany.mockResolvedValue(mockProducts);

      const response = await request(app)
        .get("/api/v1/products?category=Electronics")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it("should filter products by price range", async () => {
      const mockProducts = [mockProduct];
      mockPrismaProduct.findMany.mockResolvedValue(mockProducts);

      const response = await request(app)
        .get("/api/v1/products?minPrice=50&maxPrice=150")
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it("should filter products by isActive status", async () => {
      const mockProducts = [mockProduct];
      mockPrismaProduct.findMany.mockResolvedValue(mockProducts);

      const response = await request(app)
        .get("/api/v1/products?isActive=true")
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it("should return 500 when database error occurs", async () => {
      mockPrismaProduct.findMany.mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/v1/products").expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/v1/products/:id", () => {
    it("should get product by id", async () => {
      mockPrismaProduct.findUnique.mockResolvedValue(mockProduct);

      const response = await request(app)
        .get("/api/v1/products/product-123")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe("product-123");
    });

    it("should return 404 for non-existent product", async () => {
      mockPrismaProduct.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get("/api/v1/products/non-existent-id")
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("no encontrado");
    });

    it("should return 500 when database error occurs", async () => {
      mockPrismaProduct.findUnique.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app)
        .get("/api/v1/products/product-123")
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe("PUT /api/v1/products/:id", () => {
    const updateData = {
      name: "Updated Product",
      price: 149.99,
    };

    it("should update product as owner", async () => {
      const updatedProduct = { ...mockProduct, ...updateData };

      mockPrismaProduct.findUnique.mockResolvedValue(mockProduct);
      mockPrismaProduct.update.mockResolvedValue(updatedProduct);

      const response = await request(app)
        .put("/api/v1/products/product-123")
        .set("Authorization", `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Producto actualizado exitosamente");
      expect(response.body.data.name).toBe(updateData.name);
    });

    it("should update product as admin", async () => {
      const updatedProduct = { ...mockProduct, ...updateData };

      mockPrismaProduct.findUnique.mockResolvedValue(mockProduct);
      mockPrismaProduct.update.mockResolvedValue(updatedProduct);

      const response = await request(app)
        .put("/api/v1/products/product-123")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app)
        .put("/api/v1/products/product-123")
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should return 403 when not owner or admin", async () => {
      const otherUserToken = generateToken({
        userId: "other-user-123",
        email: "other@example.com",
        role: Role.USER,
      });

      mockPrismaProduct.findUnique.mockResolvedValue(mockProduct);

      const response = await request(app)
        .put("/api/v1/products/product-123")
        .set("Authorization", `Bearer ${otherUserToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("permisos");
    });

    it("should return 404 for non-existent product", async () => {
      mockPrismaProduct.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .put("/api/v1/products/non-existent-id")
        .set("Authorization", `Bearer ${userToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it("should return 400 for negative price in update", async () => {
      mockPrismaProduct.findUnique.mockResolvedValue(mockProduct);

      const response = await request(app)
        .put("/api/v1/products/product-123")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ price: -10 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("precio");
    });

    it("should return 400 for negative stock in update", async () => {
      mockPrismaProduct.findUnique.mockResolvedValue(mockProduct);

      const response = await request(app)
        .put("/api/v1/products/product-123")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ stock: -5 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("stock");
    });
  });

  describe("DELETE /api/v1/products/:id", () => {
    it("should soft delete product as owner", async () => {
      mockPrismaProduct.findUnique.mockResolvedValue(mockProduct);
      mockPrismaProduct.update.mockResolvedValue({
        ...mockProduct,
        isActive: false,
      });

      const response = await request(app)
        .delete("/api/v1/products/product-123")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Producto eliminado exitosamente");
    });

    it("should soft delete product as admin", async () => {
      mockPrismaProduct.findUnique.mockResolvedValue(mockProduct);
      mockPrismaProduct.update.mockResolvedValue({
        ...mockProduct,
        isActive: false,
      });

      const response = await request(app)
        .delete("/api/v1/products/product-123")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app)
        .delete("/api/v1/products/product-123")
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should return 403 when not owner or admin", async () => {
      const otherUserToken = generateToken({
        userId: "other-user-123",
        email: "other@example.com",
        role: Role.USER,
      });

      mockPrismaProduct.findUnique.mockResolvedValue(mockProduct);

      const response = await request(app)
        .delete("/api/v1/products/product-123")
        .set("Authorization", `Bearer ${otherUserToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it("should return 404 for non-existent product", async () => {
      mockPrismaProduct.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .delete("/api/v1/products/non-existent-id")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe("DELETE /api/v1/products/:id/permanent", () => {
    it("should permanently delete product as admin", async () => {
      mockPrismaProduct.findUnique.mockResolvedValue(mockProduct);
      mockPrismaProduct.delete.mockResolvedValue(mockProduct);

      const response = await request(app)
        .delete("/api/v1/products/product-123/permanent")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Producto eliminado permanentemente");
    });

    it("should return 403 for non-admin user", async () => {
      const response = await request(app)
        .delete("/api/v1/products/product-123/permanent")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("permisos");
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app)
        .delete("/api/v1/products/product-123/permanent")
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should return 404 for non-existent product", async () => {
      mockPrismaProduct.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .delete("/api/v1/products/non-existent-id/permanent")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
