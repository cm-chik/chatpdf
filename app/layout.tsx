import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import Providers from "./contexts/Providers";
import Head from "next/head";

export const metadata: Metadata = {
  title: "ChatPDF",
  description: "A little prototype by CM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </Head>
      <Providers>
        <body className={`antialiased `}>{children}</body>
        <Toaster />
      </Providers>
    </html>
  );
}
