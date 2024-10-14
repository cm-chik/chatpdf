"use client";

import { Button } from "@/components/ui/button";
import React from "react";
import { getGoogleOAuthConsentURL } from "./auth.action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RiGoogleFill } from "@remixicon/react";

export default function SignInGoogleButton() {
  const router = useRouter();
  return (
    <Button
      className="w-[400px]"
      onClick={async () => {
        {
          const url = await getGoogleOAuthConsentURL();
          if (url.success) {
            router.push(url.url!);
          } else {
            toast.error(url.error);
          }
        }
      }}
    >
      <RiGoogleFill className="w-4 h-4 mr-2" />
      Continue with Google!
    </Button>
  );
}
