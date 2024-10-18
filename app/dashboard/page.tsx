import { getUser } from "@/lib/lucia";
import { redirect } from "next/navigation";
import React from "react";
import SignOutButton from "../authenticate/SignOutButton";
import FileUpload from "@/components/FileUpload";
const DashboardPage = async () => {
  const user = await getUser();
  if (!user) {
    redirect("/authenticate");
  }

  return (
    <div className="relative w-screen min-h-screen bg-gradient-to-r from-rose-100 to-teal-100">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center align-middle text-center gap-8">
          <p className="mr-3 text-4xl font-semibold leading-snug">
            Welcome Back, {user.name}. <br />
            How can I help you today?
          </p>
          <FileUpload />
          <SignOutButton />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
