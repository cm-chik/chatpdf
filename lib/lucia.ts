import { Lucia } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { prisma } from "./prisma";
import { cookies } from "next/headers";
import { signOut } from "@/app/authenticate/auth.action";

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    name: "cookie-wow",
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
});

export const getUser = async () => {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value || null;
  if (!sessionId) {
    return null;
  }
  const { session, user } = await lucia.validateSession(sessionId);
  try {
    if (session && session.fresh) {
      //refreshing the cookie
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(
        lucia.sessionCookieName,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
    if (!session) {
      await signOut();
    }
  } catch (error) {
    console.error(error);
  }
  const dbUser = await prisma.user.findUnique({
    where: {
      id: user?.id,
    },
    select: {
      email: true,
      name: true,
    },
  });
  return dbUser;
};
