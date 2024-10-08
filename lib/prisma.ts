import { PrismaClient } from "@prisma/client";

const client = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["error", "warn"]
      : ["query", "info", "warn", "error"],
});

const GlobalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = GlobalForPrisma.prisma ?? client;

if (process.env.NODE_ENV !== "production") GlobalForPrisma.prisma = client;
