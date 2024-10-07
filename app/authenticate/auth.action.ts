"use server";
import { z } from "zod";
import { SignUpSchema } from "./SignUpForm";
import { prisma } from "@/lib/prisma";

export const signup = async (values: z.infer<typeof SignUpSchema>) => {
  console.log("Im running in the server with values", values);
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: values.email,
      },
    });
  } catch (error) {
    return {};
  }
};
