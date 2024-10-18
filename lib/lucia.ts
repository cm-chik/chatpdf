import { Lucia } from "lucia";
import pg from "pg";
import { users, sessions } from "./db/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { cookies } from "next/headers";
import { signOut } from "@/app/authenticate/auth.action";
import dotenv from "dotenv";
import { eq } from "drizzle-orm";
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.POSTGRES_URL,
});
const db = drizzle(pool);

const adapter = new DrizzlePostgreSQLAdapter(
  db,
  sessions, // Specify your session table name here
  users // Specify your user table name here
);

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
  const dbUser = await db
    .select({ id: users.id, email: users.email, name: users.name })
    .from(users)
    .where(eq(users.id, user?.id as string));

  return dbUser[0]!;
};
