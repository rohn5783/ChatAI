import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";

const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-3.5-flash",
  apiKey: process.env.GOOGLE_API_KEY,
});

export async function generateResponse(messages) {
  const langchainMessages = messages.map((message) => {
    const content = message.content ?? "";
    return message.role === "ai"
      ? new AIMessage(content)
      : new HumanMessage(content);
  });

  const response = await geminiModel.invoke(langchainMessages);

  return response.content;
}

export async function generateSingleResponse(message) {
  const response = await geminiModel.invoke([
    new SystemMessage("You are a helpful assistant."),
    new HumanMessage(message),
  ]);

  return response.content;
}

export async function generateChatTitle(message) {
  const response = await geminiModel.invoke([
    new SystemMessage("You are a helpful assistant."),
    new HumanMessage(
      `Generate a concise title for a chat conversation based on the following message: ${message}`
    ),
  ]);

  return response.content;
}
