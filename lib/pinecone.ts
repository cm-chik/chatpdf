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
  const file_name = await downloadFromS3(fileKey);

  if (!file_name) {
    throw new Error("Failed to download from S3");
  }
  // Load the PDF into LangChain=
  const loader = new PDFLoader(file_name);
  const pages = (await loader.load()) as PDFPage[];

  // Step 2. Split and segment the pages into chunks
  const documents = await Promise.all(pages.map(prepareDocumentChunks));
  // console.log(
  //   "Documents:",
  //   documents.flat().map((doc, index) => {
  //     console.log("Chunk ", index, ":", doc.metadata.text);
  //   })
  // );
  // Step 3. vectorise and embed indibvidual documents
  const vectors = await Promise.all(documents.flat().map(embedDocument));

  // Step 4. upload to pinecone
  const client = await getPineconeClient();
  const pineconeIndex = client.index(process.env.PINECONE_INDEX!);
  const namespace = pineconeIndex.namespace(convertToAscii(fileKey));
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
export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

async function prepareDocumentChunks(page: PDFPage) {
  const { metadata } = page;
  const pageContent = page.pageContent.replace(/\n/g, " ");
  const splitter = new RecursiveCharacterTextSplitter({
    separators: ["\n\n", "\n", "    ", "   ", "  ", " "],
    // chunkSize: 1000,
    // chunkOverlap: 200,
  });
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
      },
    }),
  ]);
  docs.map((doc) => {
    doc.metadata.text = truncateStringByBytes(doc.pageContent, 36000);
  });

  return docs;
}
