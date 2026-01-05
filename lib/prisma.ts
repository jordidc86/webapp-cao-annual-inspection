import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const getPrisma = () => {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('dummy')) {
    return null
  }
  
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient()
  }
  return globalForPrisma.prisma
}

export const prisma = getPrisma() as PrismaClient
