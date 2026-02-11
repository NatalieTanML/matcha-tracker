import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Cloudflare Workers environment interface
export interface Env {
  DATABASE_URL: string;
}

// Create a function to get Prisma client with proper adapter
export function createPrismaClient(env: Env) {
  const adapter = new PrismaPg({
    connectionString: env.DATABASE_URL,
  });
  return new PrismaClient({ adapter });
}

// For seed script only (Node.js environment)
let prismaInstance: PrismaClient | undefined;

export function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
    });
    prismaInstance = new PrismaClient({ adapter });
  }
  return prismaInstance;
}
