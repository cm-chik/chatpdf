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
    <div>
      Welcome Back! {user.email}
      <br></br>
      <FileUpload />
      <SignOutButton />
    </div>
  );
};

export default DashboardPage;
