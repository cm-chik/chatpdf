import { loadS3IntoPinecone } from "@/lib/pinecone";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUser } from "@/lib/lucia";
import { chat_files } from "@prisma/client";
import { getS3Url } from "@/lib/s3";
import { redirect } from "next/navigation";
import { chats } from "@/lib/db/schema";

export async function POST(req: Request, res: Response) {
  const user = await getUser();
  if (!user) {
    redirect("/authenticate");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { file_key, file_name } = body;
    await loadS3IntoPinecone(file_key);
    await db
      .insert(chat_files)
      .values({
        file_key: file_key,
        pdfName: file_name,
        pdfUrl: getS3Url(file_key),
        userId: user.id,
        created_at: new Date(),
      })
      .returning({ insertedId: chats.id });

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
