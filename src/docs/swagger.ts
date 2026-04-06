import swaggerUi from "swagger-ui-express";
import { Application } from "express";
import { env } from "../config/env";

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Finance Data Processing & Access Control API",
    version: "1.0.0",
    description: `
## Finance Dashboard Backend API

A role-based finance management backend built with **Node 22 + TypeScript**, **Express**, **Prisma**, and **Supabase PostgreSQL**.

### Roles
| Role    | Permissions |
|---------|-------------|
| VIEWER  | View transactions, summary, recent activity, category breakdown |
| ANALYST | All VIEWER permissions + monthly/weekly trends |
| ADMIN   | Full access — create/update/delete transactions, manage users |

### Authentication
All protected routes require a Bearer token in the \`Authorization\` header.
\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`
    `,
    contact: {
      name: "Sundram Mishra",
      email: "mishrasundram091@gmail.com",
    },
  },
  servers: [
    {
      url: `http://localhost:${env.port}`,
      description: "Local development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          role: { type: "string", enum: ["VIEWER", "ANALYST", "ADMIN"] },
          isActive: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Transaction: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          amount: { type: "number" },
          type: { type: "string", enum: ["INCOME", "EXPENSE"] },
          category: { type: "string" },
          date: { type: "string", format: "date" },
          notes: { type: "string" },
          isDeleted: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          user: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              email: { type: "string" },
            },
          },
        },
      },
      ApiSuccess: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string" },
          data: { type: "object" },
          meta: { type: "object" },
        },
      },
      ApiError: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string" },
        },
      },
      PaginationMeta: {
        type: "object",
        properties: {
          total: { type: "integer" },
          page: { type: "integer" },
          limit: { type: "integer" },
          totalPages: { type: "integer" },
        },
      },
    },
  },
  tags: [
    { name: "Auth", description: "Authentication and profile" },
    { name: "Users", description: "User management — Admin only" },
    { name: "Transactions", description: "Financial records management" },
    { name: "Dashboard", description: "Summary and analytics endpoints" },
  ],
  paths: {
    // Auth
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", example: "Sundram Mishra" },
                  email: { type: "string", example: "admin@finance.com" },
                  password: { type: "string", example: "Password123!" },
                  role: { type: "string", enum: ["VIEWER", "ANALYST", "ADMIN"], example: "ADMIN" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "User registered successfully" },
          400: { description: "Validation error" },
          409: { description: "Email already exists" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and receive JWT",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "admin@finance.com" },
                  password: { type: "string", example: "Password123!" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Login successful, returns JWT token" },
          401: { description: "Invalid credentials" },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current authenticated user",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Current user profile" },
          401: { description: "Unauthorized" },
        },
      },
    },
    // Users
    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "List all users (Admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", default: 1 } },
          { in: "query", name: "limit", schema: { type: "integer", default: 10 } },
          { in: "query", name: "role", schema: { type: "string", enum: ["VIEWER", "ANALYST", "ADMIN"] } },
          { in: "query", name: "isActive", schema: { type: "boolean" } },
        ],
        responses: {
          200: { description: "Paginated list of users" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/api/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get single user (Admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "User found" }, 404: { description: "Not found" } },
      },
    },
    "/api/users/{id}/role": {
      patch: {
        tags: ["Users"],
        summary: "Update user role (Admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["role"],
                properties: {
                  role: { type: "string", enum: ["VIEWER", "ANALYST", "ADMIN"] },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Role updated" }, 403: { description: "Forbidden" } },
      },
    },
    "/api/users/{id}/status": {
      patch: {
        tags: ["Users"],
        summary: "Activate or deactivate user (Admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["isActive"],
                properties: { isActive: { type: "boolean" } },
              },
            },
          },
        },
        responses: { 200: { description: "Status updated" } },
      },
    },
    // Transactions
    "/api/transactions": {
      get: {
        tags: ["Transactions"],
        summary: "List transactions with filters and pagination",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "query", name: "page", schema: { type: "integer" } },
          { in: "query", name: "limit", schema: { type: "integer" } },
          { in: "query", name: "type", schema: { type: "string", enum: ["INCOME", "EXPENSE"] } },
          { in: "query", name: "category", schema: { type: "string" } },
          { in: "query", name: "from", schema: { type: "string", format: "date" } },
          { in: "query", name: "to", schema: { type: "string", format: "date" } },
          { in: "query", name: "search", schema: { type: "string" } },
        ],
        responses: { 200: { description: "Paginated transactions" } },
      },
      post: {
        tags: ["Transactions"],
        summary: "Create transaction (Admin only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["amount", "type", "category", "date"],
                properties: {
                  amount: { type: "number", example: 5000 },
                  type: { type: "string", enum: ["INCOME", "EXPENSE"], example: "INCOME" },
                  category: { type: "string", example: "Salary" },
                  date: { type: "string", format: "date", example: "2025-04-01" },
                  notes: { type: "string", example: "Monthly salary" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Transaction created" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/api/transactions/{id}": {
      get: {
        tags: ["Transactions"],
        summary: "Get a single transaction",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Transaction found" }, 404: { description: "Not found" } },
      },
      put: {
        tags: ["Transactions"],
        summary: "Update a transaction (Admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  amount: { type: "number" },
                  type: { type: "string", enum: ["INCOME", "EXPENSE"] },
                  category: { type: "string" },
                  date: { type: "string", format: "date" },
                  notes: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Updated" }, 404: { description: "Not found" } },
      },
      delete: {
        tags: ["Transactions"],
        summary: "Soft delete a transaction (Admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Deleted (soft)" }, 404: { description: "Not found" } },
      },
    },
    // Dashboard
    "/api/dashboard/summary": {
      get: {
        tags: ["Dashboard"],
        summary: "Total income, expenses, and net balance (all roles)",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Summary data" } },
      },
    },
    "/api/dashboard/by-category": {
      get: {
        tags: ["Dashboard"],
        summary: "Category-wise totals (all roles)",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Category breakdown" } },
      },
    },
    "/api/dashboard/trends/monthly": {
      get: {
        tags: ["Dashboard"],
        summary: "Monthly trends — last 12 months (Analyst + Admin)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Monthly trend data" },
          403: { description: "Forbidden for VIEWER" },
        },
      },
    },
    "/api/dashboard/trends/weekly": {
      get: {
        tags: ["Dashboard"],
        summary: "Weekly trends — last 8 weeks (Analyst + Admin)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Weekly trend data" },
          403: { description: "Forbidden for VIEWER" },
        },
      },
    },
    "/api/dashboard/recent": {
      get: {
        tags: ["Dashboard"],
        summary: "Last 10 transactions — recent activity (all roles)",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Recent activity" } },
      },
    },
  },
};

export function setupSwagger(app: Application): void {
  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      customSiteTitle: "Finance API Docs",
      customCss: ".swagger-ui .topbar { display: none }",
    })
  );
}