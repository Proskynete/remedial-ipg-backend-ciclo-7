/**
 * Prisma Mock
 * Mock Prisma client for testing
 */

export const mockPrismaUser = {
  findUnique: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

export const mockPrismaProduct = {
  findUnique: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

export const prismaMock = {
  user: mockPrismaUser,
  product: mockPrismaProduct,
  $connect: jest.fn(),
  $disconnect: jest.fn(),
};

jest.mock("../../src/utils/prisma", () => ({
  prisma: prismaMock,
  connectDB: jest.fn(),
  disconnectDB: jest.fn(),
}));
