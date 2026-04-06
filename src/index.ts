import app from "./app";
import { env } from "./config/env";
import { prisma } from "./config/database";

async function bootstrap() {
  // Verify DB connection before starting
  try {
    await prisma.$connect();
    console.log("✅ Database connected");
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  }

  const server = app.listen(env.port, () => {
    console.log(`\n🚀 Server running on http://localhost:${env.port}`);
    console.log(`📖 API Docs: http://localhost:${env.port}/api/docs`);
    console.log(`🌿 Environment: ${env.nodeEnv}\n`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await prisma.$disconnect();
      console.log("✅ DB disconnected. Server closed.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // Catch unhandled errors
  process.on("unhandledRejection", (reason) => {
    console.error("💥 Unhandled Rejection:", reason);
    process.exit(1);
  });

  process.on("uncaughtException", (err) => {
    console.error("💥 Uncaught Exception:", err);
    process.exit(1);
  });
}

bootstrap();