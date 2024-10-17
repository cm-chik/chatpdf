"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";


export default function Home() {
  const router = useRouter();
  return (
    <div className="w-screen min-h-screen bg-gradient-to-r from-rose-100 to-teal-100">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center align-middle text-center gap-4">
          <h1 className="mr-3 text-5xl font-semibold">Chat with any PDF</h1>
          <p className="max-w-xl mt-1 text-lg text-slate-600">
            Join millions of students, researchers and professionals to
            instantly answer questions and understand research with AI
          </p>
          <Button onClick={() => router.push("/authenticate")}>
            Try it Now!
          </Button>
        </div>
      </div>
    </div>
  );
}
