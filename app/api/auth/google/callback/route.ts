import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (code || !state) {
    console.error("No code or state");
    return new Response("Invalid request", { status: 400 });
  }
  const codeVerifier = cookies().get("code_verifier")?.value;
  const savedState = cookies().get("savedState")?.value;
  if (!codeVerifier && !savedState){
    console.error("No codeVerifier or savedState");
    return new Response("Invalid request", { status: 400 });
  }
  if (savedState !== state){
    console.error("State mismatch");
    return new Response("Invalid request", { status: 400 });
  }  

  const { accessToken } = await googleOAuthClient.validateAuthorizationCode(code, codeVerifier);
  return NextResponse.redirect(url);
}


export async function


