import { PrismaClient } from '@prisma/client';
// Singleton pattern for Prisma in dev
const globalForPrisma = global;
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = prisma;
