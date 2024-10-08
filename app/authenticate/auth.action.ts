"use server";
import { z } from "zod";
import { SignUpSchema } from "./SignUpForm";
import { prisma } from "@/lib/prisma";
import { Argon2id } from "oslo/password";
import { cookies } from "next/headers";
import { lucia } from "@/lib/lucia";

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
    console.log("Creating session with data:", user);
    const session = await lucia.createSession(user.id, {});
    console.log("Creating session cookie");
    const sessionCookie = lucia.createSessionCookie(session.id);
    console.log("Setting cookie");
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
    console.log("Returning user");
    return { user, success: true };
  } catch (error) {
    console.log("Error", error);
    return { error: "Something went wrong", success: false };
  }
};
