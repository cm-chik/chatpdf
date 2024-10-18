"use server";

import { z } from "zod";
import { SignUpSchema } from "./SignUpForm";
import { SignInSchema } from "./SignInForm";
import { Argon2id } from "oslo/password";
import { cookies } from "next/headers";
import { lucia } from "@/lib/lucia";
import { GoogleOAuthClient } from "@/lib/googleOAuth";
import { generateCodeVerifier, generateState } from "arctic";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { v4 } from "uuid";
import { eq } from "drizzle-orm";

export const signUp = async (values: z.infer<typeof SignUpSchema>) => {
  try {
    //If user exists, return error
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, values.email));
    if (existingUser.length > 0) {
      return { error: "User already exists", success: false };
    }
    const hashedPassword = await new Argon2id().hash(values.password);
    //create user into db
    const user = await db
      .insert(users!)
      .values({
        id: v4().toString(),
        name: values.name,
        email: values.email,
        hashedPassword: hashedPassword,
        role: "user",
      })
      .returning();
    //save assistant message into db
    const session = await lucia.createSession(user[0].id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
    return { userID: user, success: true };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong", success: false };
  }
};

export const signIn = async (values: z.infer<typeof SignInSchema>) => {
  try {
    //If user exists, return error
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, values.email));
    console.log("user: ", user);
    console.log("user.length: ", user.length);
    if (user.length === 0) {
      return { error: "User does not exist", success: false };
    }

    const passwordMatch = await new Argon2id().verify(
      user[0].hashedPassword!,
      values.password
    );
    if (!passwordMatch) {
      return { error: "Invalid password", success: false };
    }
    const session = await lucia.createSession(user[0].id, {});
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
