import { PrismaClient } from "@prisma/client";

const client = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["error", "warn"]
      : ["query", "info", "warn", "error"],
});

const GlobalPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = GlobalPrisma.prisma ?? client;

if (process.env.NODE_ENV !== "production") GlobalPrisma.prisma = client;
