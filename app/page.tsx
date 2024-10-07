"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
export default function Home() {
  const router = useRouter();
  return (
    <div className="">
      <Button onClick={() => router.push("/authenticate")}>Try it Now!</Button>
    </div>
  );
}
