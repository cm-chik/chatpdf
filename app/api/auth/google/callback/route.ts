import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { GoogleOAuthClient } from "@/lib/googleOAuth";
import { lucia } from "@/lib/lucia";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { v4 } from "uuid";
//http://localhost:8642/api/auth/google/callback
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) {
    console.error("No code or state");
    return new Response("Invalid request", { status: 400 });
  }
  const codeVerifier = cookies().get("codeVerifier")?.value;
  const savedState = cookies().get("state")?.value;

  if (!codeVerifier || !savedState) {
    console.error("No codeVerifier or savedState");
    return new Response("Invalid request", { status: 400 });
  }
  if (savedState !== state) {
    console.error("State mismatch");
    return new Response("Invalid request", { status: 400 });
  }

  const { accessToken } = await GoogleOAuthClient.validateAuthorizationCode(
    code,
    codeVerifier
  );
  const googleResponse = await fetch(
    "https://www.googleapis.com/oauth2/v1/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  if (googleResponse.status !== 200) {
    console.error("Failed to fetch user info", googleResponse.status);
    return new Response("Failed to fetch user info", {
      status: googleResponse.status,
    });
  }
  const googleData = (await googleResponse.json()) as {
    id: string;
    email: string;
    name: string;
    picture: string;
  };
  let userId: string = "";
  //if email exist, sign in, else sign up
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, googleData.email));
  if (existingUser[0]) {
    userId = existingUser[0].id;
  } else {
    const user = await db
      .insert(users)
      .values({
        id: v4().toString(),
        name: googleData.name,
        email: googleData.email,
        picture: googleData.picture,
      })
      .returning({ id: users.id });
    userId = user[0].id;
  }
  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  return redirect("/dashboard");
}
