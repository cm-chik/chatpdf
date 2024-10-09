import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { GoogleOAuthClient } from "@/lib/googleOAuth";
import { prisma } from "@/lib/prisma";
import { lucia } from "@/lib/lucia";
import { redirect } from "next/navigation";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
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
        Authentication: `Bearer ${accessToken}`,
      },
    }
  );
  if (googleResponse.status !== 200) {
    console.error("Failed to fetch user info");
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
  const existingUser = await prisma.user.findUnique({
    where: { email: googleData.email },
  });
  if (existingUser) {
    userId = existingUser.id;
  } else {
    const user = await prisma.user.create({
      data: {
        name: googleData.name,
        email: googleData.email,
        picture: googleData.picture,
      },
    });
    userId = user.id;
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