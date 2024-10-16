import { createOpenAI } from "@ai-sdk/openai";
import { StreamData, streamText } from "ai";
import { getContext } from "@/lib/context";
import { db } from "@/lib/db";
import { chats, messages as _messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const runtime = "edge";

const openai = createOpenAI({
  baseURL: process.env.OPENAI_BASE_URL!,
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { messages, chatId } = await req.json();
    const _chats = await db.select().from(chats).where(eq(chats.id, chatId));

    if (_chats.length != 1) {
      return NextResponse.json({ error: "chat not found" }, { status: 404 });
    }
    const lastMessage = messages[messages.length - 1];
    const fileKey = _chats[0].fileKey;

    //get context enable extract relevant data from pdf
    const context = await getContext(lastMessage.content, fileKey);

    const promptStr = {
      role: "system",
      content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
      AI is a well-behaved and well-mannered individual.
      AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
      AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
      AI assistant is a big fan of Pinecone and Vercel.
      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK
      AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
      If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
      AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
      AI assistant will not invent anything that is not drawn directly from the context.
      `,
    };


   const data = new StreamData();
   data.append({ test: promptStr });
   //change to streamText
   const textStream = await streamText({
     model: openai(process.env.GPT_MODEL!),
     system: promptStr.content,
     messages: [promptStr, ...messages],

     onFinish: async ({ text }) => {
       // Changed to async function
       data.close(); //save msg in stream
       try {
         //save user message into db
         await db.insert(_messages!).values({
           chatsId: chatId,
           content: lastMessage.content,
           role: "user",
         });
         //save assistant message into db
         await db.insert(_messages!).values({
           chatsId: chatId,
           content: text.toString(),
           role: "assistant",
         });
       } catch (error) {
         console.error("Error saving message:", error);
       }
     },
   });
    return textStream.toDataStreamResponse({ data });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}
