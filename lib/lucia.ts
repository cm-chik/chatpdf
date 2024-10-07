import { Lucia } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { prisma } from "./prisma";

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = () => {
  return (
      name: 'cookie-wow',
      expire: false,
      attributes: {
          secure: process.env.NODE_ENV === 'production'
      }
  )
}

export default lucia

1:01:00