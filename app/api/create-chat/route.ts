import { loadS3IntoPinecone } from "@/lib/pinecone";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUser } from "@/lib/lucia";
import { getS3Url } from "@/lib/s3";
import { redirect } from "next/navigation";
import { chats } from "@/lib/db/schema";

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) {
    redirect("/authenticate");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { file_key, file_name } = body;
    await loadS3IntoPinecone(file_key);
    const chat_id = await db
      .insert(chats)
      .values({
        fileKey: file_key,
        pdfName: file_name,
        pdfUrl: getS3Url(file_key),
        userId: user.id,
      })
      .returning({ insertedId: chats.id });
    // console.log("Chat created successfully: ", chat_id[0].insertedId);
    return NextResponse.json(
      { chat_id: chat_id[0].insertedId },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
