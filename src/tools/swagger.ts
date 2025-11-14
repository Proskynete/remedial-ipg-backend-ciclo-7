import { Express, Request, Response } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import { version } from "../../package.json";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Remedial IPG - Backend - Ciclo 7",
      description:
        "Prueba remedial de Eduardo Álvarez para el curso de Backend",
      version,
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor de desarrollo local",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Ingresa el token JWT obtenido del endpoint de login (sin 'Bearer ' prefix)",
        },
      },
      schemas: {
        // Authentication Schemas
        RegisterRequest: {
          type: "object",
          required: ["email", "password", "firstName"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "usuario@ejemplo.com",
            },
            password: {
              type: "string",
              format: "password",
              minLength: 6,
              example: "Password123!",
            },
            firstName: {
              type: "string",
              example: "Juan",
            },
            lastName: {
              type: "string",
              example: "Pérez",
            },
            role: {
              type: "string",
              enum: ["USER", "ADMIN", "MODERATOR"],
              example: "USER",
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "usuario@ejemplo.com",
            },
            password: {
              type: "string",
              format: "password",
              example: "Password123!",
            },
          },
        },
        UserResponse: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              example: "550e8400-e29b-41d4-a716-446655440000",
            },
            email: {
              type: "string",
              format: "email",
              example: "usuario@ejemplo.com",
            },
            firstName: {
              type: "string",
              example: "Juan",
            },
            lastName: {
              type: "string",
              nullable: true,
              example: "Pérez",
            },
            role: {
              type: "string",
              enum: ["USER", "ADMIN", "MODERATOR"],
              example: "USER",
            },
            isActive: {
              type: "boolean",
              example: true,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:00.000Z",
            },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Usuario registrado exitosamente",
            },
            data: {
              type: "object",
              properties: {
                token: {
                  type: "string",
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },
                user: {
                  $ref: "#/components/schemas/UserResponse",
                },
              },
            },
          },
        },
        // Product Schemas
        CreateProductRequest: {
          type: "object",
          required: ["name", "price", "stock", "category"],
          properties: {
            name: {
              type: "string",
              example: "Laptop HP Pavilion",
            },
            description: {
              type: "string",
              example: "Laptop HP Pavilion de 15.6 pulgadas, 16GB RAM",
            },
            price: {
              type: "number",
              format: "float",
              minimum: 0,
              example: 899.99,
            },
            stock: {
              type: "integer",
              minimum: 0,
              example: 10,
            },
            category: {
              type: "string",
              example: "Electrónica",
            },
            image: {
              type: "string",
              format: "uri",
              example: "https://ejemplo.com/images/laptop-hp.jpg",
            },
          },
        },
        UpdateProductRequest: {
          type: "object",
          properties: {
            name: {
              type: "string",
              example: "Laptop HP Pavilion",
            },
            description: {
              type: "string",
              example: "Laptop HP Pavilion actualizada",
            },
            price: {
              type: "number",
              format: "float",
              minimum: 0,
              example: 799.99,
            },
            stock: {
              type: "integer",
              minimum: 0,
              example: 15,
            },
            category: {
              type: "string",
              example: "Electrónica",
            },
            image: {
              type: "string",
              format: "uri",
              example: "https://ejemplo.com/images/laptop-hp-new.jpg",
            },
            isActive: {
              type: "boolean",
              example: true,
            },
          },
        },
        ProductResponse: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              example: "660e8400-e29b-41d4-a716-446655440000",
            },
            name: {
              type: "string",
              example: "Laptop HP Pavilion",
            },
            description: {
              type: "string",
              nullable: true,
              example: "Laptop HP Pavilion de 15.6 pulgadas",
            },
            price: {
              type: "number",
              format: "float",
              example: 899.99,
            },
            stock: {
              type: "integer",
              example: 10,
            },
            category: {
              type: "string",
              example: "Electrónica",
            },
            image: {
              type: "string",
              nullable: true,
              example: "https://ejemplo.com/images/laptop-hp.jpg",
            },
            isActive: {
              type: "boolean",
              example: true,
            },
            userId: {
              type: "string",
              format: "uuid",
              example: "550e8400-e29b-41d4-a716-446655440000",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:00.000Z",
            },
          },
        },
        ProductsListResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            count: {
              type: "integer",
              example: 10,
            },
            data: {
              type: "array",
              items: {
                $ref: "#/components/schemas/ProductResponse",
              },
            },
          },
        },
        ProductSingleResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Producto creado exitosamente",
            },
            data: {
              $ref: "#/components/schemas/ProductResponse",
            },
          },
        },
        // Error Schemas
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Error al procesar la solicitud",
            },
          },
        },
        ValidationError: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Error de validación",
            },
          },
        },
        UnauthorizedError: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Token inválido o expirado",
            },
          },
        },
        NotFoundError: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Recurso no encontrado",
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts", "./src/models/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);

const swaggerDocs = (app: Express): void => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api-docs.json", (_: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.json(swaggerSpec);
  });
};

export { swaggerDocs };
