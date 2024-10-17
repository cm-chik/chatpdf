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
import DashboardPage from "@/app/dashboard/page";

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

  const currentChat = _chats.find((chat) => chat.id === parseInt(chatId));
  const isPro = await checkSubscription();
  return (
    <div className="flex max-h-screen ">
      <div className="flex w-full max-h-screen">
        {/* chat sidebar */}
        <div className="flex-[1] max-w-xs">
          <ChatSideBar chats={_chats} chatId={parseInt(chatId)} isPro={isPro} />
        </div>
        {currentChat ? (
          <>
            {/* pdf viewer */}
            <div className="max-h-screen flex-[5]  bg-gray-900">
              <PDFViewer pdf_url={currentChat.pdfUrl || ""} />
            </div>
            {/* chat component */}
            <div className="flex-[3] border-l-4 h-full border-l-slate-200 bg-white ">
              <ChatComponent chatId={parseInt(chatId)} />
            </div>
          </>
        ) : (
          <DashboardPage />
        )}
      </div>
    </div>
  );
};
export default ChatPage;
