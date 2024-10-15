import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { getUser } from "@/lib/lucia";
import { redirect } from "next/navigation";
import React from "react";
import ChatComponent from "@/components/ChatComponent";
import ChatSideBar from "@/components/ChatSideBar";
import PDFViewer from "@/components/PDFViewer";
import { checkSubscription } from "@/lib/subscription";
import { eq } from "drizzle-orm";

type Props = {
  params: { chatId: string };
};

const ChatPage = async ({ params: { chatId } }: Props) => {
  const user = await getUser();
  if (!user) {
    redirect("/authenticate");
  }
  const _chats = await db
    .select()
    .from(chats)
    .where(eq(chats.userId, user!.id));
  if (!_chats) {
    console.log("no chats");
    return redirect("/");
  }
  if (!_chats.find((chat) => chat.id === parseInt(chatId))) {
    console.log("no chats, redirecting");
    return <div> No chat</div>;
  }

  const currentChat = _chats.find((chat) => chat.id === parseInt(chatId));
  const isPro = await checkSubscription();
  
  return (
    <div className="flex max-h-screen overflow-scroll">
      <div className="flex w-full max-h-screen overflow-scroll">
        {/* chat sidebar */}
        <div className="flex-[1] max-w-xs">
          <ChatSideBar chats={_chats} chatId={parseInt(chatId)} isPro={isPro} />
        </div>
        {/* pdf viewer */}
        <div className="max-h-screen p-4 oveflow-scroll flex-[5]">
          <PDFViewer pdf_url={currentChat?.pdfUrl || ""} />
        </div>
        {/* chat component */}
        <div className="flex-[3] border-l-4 border-l-slate-200">
          <ChatComponent chatId={parseInt(chatId)} />
        </div>
      </div>
    </div>
  );
};
export default ChatPage;
