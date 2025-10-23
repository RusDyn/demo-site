import { OpenAI } from "openai";

let cachedClient: OpenAI | null = null;

function createClient(): OpenAI {
  if (typeof window !== "undefined") {
    throw new Error("The OpenAI client should only be instantiated on the server.");
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not defined in the environment.");
  }

  return new OpenAI({
    apiKey,
    organization: process.env.OPENAI_ORG_ID,
    project: process.env.OPENAI_PROJECT_ID,
    baseURL: process.env.OPENAI_BASE_URL,
  });
}

export function getOpenAIClient(): OpenAI {
  cachedClient ??= createClient();

  return cachedClient;
}
