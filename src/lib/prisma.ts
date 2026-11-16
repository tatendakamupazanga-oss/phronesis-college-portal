import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Append connection pool parameters to DATABASE_URL if missing
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL || '';
  if (!url) return url;
  
  const separator = url.includes('?') ? '&' : '?';
  const params: string[] = [];

  if (!url.includes('connect_timeout')) {
    params.push('connect_timeout=30');
  }
  if (!url.includes('pool_timeout')) {
    params.push('pool_timeout=30');
  }

  return params.length > 0 ? `${url}${separator}${params.join('&')}` : url;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;