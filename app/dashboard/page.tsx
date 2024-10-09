import { getUser } from "@/lib/lucia";
import { redirect } from "next/navigation";
import React from "react";
import SignOutButton from "../authenticate/SignOutButton";

const DashboardPage = async () => {
  const user = await getUser();
  if (!user) {
    redirect("/authenticate");
  }

  return (
    <div>
      You are logged in as {user.email}
      <SignOutButton />
    </div>
  );
};

export default DashboardPage;
