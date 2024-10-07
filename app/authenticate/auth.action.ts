"use server";
import { z } from "zod";
import { SignUpSchema } from "./SignUpForm";
import { prisma } from "@/lib/prisma";
import { Argon2id } from "oslo/password";

export const signup = async (values: z.infer<typeof SignUpSchema>) => {
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
        password: values.password,
        hashedPassword: hashedPassword,
      },
    });
    return { user, success: true };
  } catch (error) {
    return { error: "Something went wrong", success: false };
  }
};
