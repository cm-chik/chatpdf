import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { convertToAscii } from "./utils";
import md5 from "md5";
import { getEmbeddings } from "./embeddings";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";

let pinecone: Pinecone | null = null;

export const getPineconeClient = async () => {
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
  const documents = await Promise.all(pages.map(prepareDocumentChunks));
  // Step 3. vectorise and embed indibvidual documents
  const vectors = await Promise.all(documents.flat().map(embedDocument));

  // Step 4. upload to pinecone
  const client = await getPineconeClient();
  const pineconeIndex = client.index("chatpdf");
  const namespace = pineconeIndex.namespace(convertToAscii(fileKey));

  console.log("inserting vectors into pinecone");
  await namespace.upsert(vectors);

  return documents[0];
}

async function embedDocument(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
    const hash = md5(doc.pageContent);

    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        pageNumber: doc.metadata.pageNumber,
      },
    } as PineconeRecord;
  } catch (error) {
    console.log("error embedding document", error);
    throw error;
  }
}

async function prepareDocumentChunks(page: PDFPage, splitSize: number) {
  let { pageContent, metadata } = page;
  pageContent = pageContent.replace("/\n/g", "");
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: splitSize,
    chunkOverlap: 200,
  });
  const texts = splitter.createDocuments([pageContent]);

  return texts;
}
