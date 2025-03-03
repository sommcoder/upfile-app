import { PrismaClient } from "@prisma/client";

// TODO: will need to adjust this cause we're not using Prisma!
declare global {
  var prisma: PrismaClient;
}

if (process.env.NODE_ENV !== "production") {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
}

const prisma: PrismaClient = global.prisma || new PrismaClient();

export default prisma;
