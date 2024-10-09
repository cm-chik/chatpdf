"use client";

import { Button } from "@/components/ui/button";
import React from "react";
import { getGoogleOAuthConsentURL } from "./auth.action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SignInGoogleButton() {
  const router = useRouter();
  return (
    <Button
      className="w-[400px]"
      onClick={async () => {
        {
          console.log("start");
          const url = await getGoogleOAuthConsentURL();
          console.log("url:", url);
          if (url.success) {
            router.push(url.url!);
          } else {
            toast.error(url.error);
          }
        }
      }}
    >
      Continue with Google!
    </Button>
  );
}