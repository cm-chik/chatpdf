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
      model: "nomic-embed-text-v1.5",
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
    console.log("getEmbeddings error:", error);
    throw error;
  }
}

// import { LMStudioClient } from "@lmstudio/sdk";

// const client = new LMStudioClient();

// export async function getEmbeddings(text: string) {
//   const modelPath = "lmstudio-ai/gemma-2b-it-GGUF";
//   const llama3 = await client.llm.load(modelPath);
//   const prediction = llama3.complete("The meaning of life is");

//   for await (const text of prediction) {
//     process.stdout.write(text);
//   }
//   console.warn(prediction);
// }
