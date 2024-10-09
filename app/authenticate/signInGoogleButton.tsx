"use client";

import { Button } from "@/components/ui/button";
import React from "react";
import { getGoogleOAuthConsentURL } from "./auth.action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SignInGoogleButton() {
  const router = useRouter();

  async function handleOnClick() {
    const res = await getGoogleOAuthConsentURL();
    if (res.success) {
      router.push(res.url!);
    } else {
      toast.error(res.error);
    }
  }

  return (
    <Button
      className="w-[400px]"
      onClick={() => {
        handleOnClick(router);
      }}
    >
      Sign In to Google
    </Button>
  );
}
