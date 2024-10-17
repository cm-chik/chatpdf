import { OpenAIApi, Configuration } from "openai-edge";

const config = new Configuration({
  basePath: process.env.OPENAI_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

export async function getEmbeddings(text: string) {
  try {
    const response = await openai.createEmbedding({
      input: text.replace(/\n/g, " "),
      model: process.env.EMBEDDING_MODEL!,
    });
    const result = await response.json();
    if (
      process.env.OPENAI_BASE_URL?.search("localhost") !== -1 &&
      !result.data[0].embedding
    ) {
      throw new Error("No embeddings returned from Local Search");
    } else if (
      process.env.OPENAI_BASE_URL?.search("localhost") === -1 &&
      !result.data[0].embedding
    ) {
      throw new Error("No embeddings returned from OpenAI");
    }
    return result.data[0].embedding as number[];
  } catch (error) {
    console.error("getEmbeddings error:", error);
    throw error;
  }
}