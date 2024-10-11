import { Pinecone } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";

let pinecone: Pinecone | null = null;

export const getPineconeClien = async () => {
  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
      //   environment: process.env.PINECONE_ENVIRONMENT!,
    });
  }
  return pinecone;
};

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

export async function loadS3IntoPinecone(fileKey: string) {
  // Step 1. Obtain the PDF from S3
  console.log("Downloading from S3...");
  const file_name = await downloadFromS3(fileKey);
  console.log("Downloaded from S3");
  if (!file_name) {
    throw new Error("Failed to download from S3");
  }

  // Load the PDF into LangChain
  const loader = new PDFLoader(file_name);
  const pages = (await loader.load()) as PDFPage[];

  // Step 2. Split and segment the pages into chunks

  return pages;
}

async function prepareDocumentChunks(page: PDFPage, splitSize: number) {
  let { pageContent, metadata } = page;
  pageContent = pageContent.replace("/\n/g", "");
}
