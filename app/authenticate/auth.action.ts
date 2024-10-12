import { z } from "zod";
import { SignUpSchema } from "./SignUpForm";
import { SignInSchema } from "./SignInForm";
import { prisma } from "@/lib/prisma";
import { Argon2id } from "oslo/password";
import { cookies } from "next/headers";
import { lucia } from "@/lib/lucia";
import { GoogleOAuthClient } from "@/lib/googleOAuth";
import { generateCodeVerifier, generateState } from "arctic";

export const signUp = async (values: z.infer<typeof SignUpSchema>) => {
  try {
    //If user exists, return error
    const existingUser = await prisma.user.findUnique({
      where: {
        email: values.email,
      },
    });
    if (existingUser) {
      return { error: "User already exists", success: false };
    }
    const hashedPassword = await new Argon2id().hash(values.password);
    const user = await prisma.user.create({
      data: {
        name: values.name,
        email: values.email,
        hashedPassword: hashedPassword,
      },
    });
    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
    return { user, success: true };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong", success: false };
  }
};

export const signIn = async (values: z.infer<typeof SignInSchema>) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: values.email,
      },
    });
    if (!user) {
      return { error: "User not found", success: false };
    }
    const passwordMatch = await new Argon2id().verify(
      user.hashedPassword!,
      values.password
    );
    if (!passwordMatch) {
      return { error: "Invalid password", success: false };
    }
    const session = await lucia.createSession(user.id, {});
    console.log("session created successfully");
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
    return { user, success: true };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong", success: false };
  }
};

export const signOut = async () => {
  try {
    const sessionCookie = lucia.createBlankSessionCookie();
    cookies().set(
      lucia.sessionCookieName,
      sessionCookie.value,
      sessionCookie.attributes
    );
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
};

export const getGoogleOAuthConsentURL = async () => {
  try {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    cookies().set("codeVerifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    cookies().set("state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    const authURL = await GoogleOAuthClient.createAuthorizationURL(
      state,
      codeVerifier,
      {
        scopes: ["email", "profile"],
      }
    );
    if (authURL.href) {
      return { success: true, url: authURL.toString() };
    } else {
      return { success: false, error: "Cannot get URL from Google" };
    }
  } catch (error) {
    console.error(error);
    return { success: false, error: "Something went wrong" };
  }
};
