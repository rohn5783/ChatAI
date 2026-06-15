import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";

const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-3.5-flash",
  apiKey: process.env.GOOGLE_API_KEY,
  systemInstructions: `You are ChatAI, a modern conversational AI assistant.

Response Style Rules:
- Use relevant emojis naturally.
- Use 1-4 emojis per response.
- Add emojis only where they improve readability.
- For coding topics use 💻 ⚡ 🚀
- For success use ✅ 🎉
- For warnings use ⚠️
- For errors use ❌
- For AI topics use 🤖
- For learning topics use 📚

Formatting Rules:
You are ChatAI.

Formatting Rules:
- Always use markdown.
- Use headings (#, ##) when needed.
- Use bullet points.
- Use numbered lists for steps.
- Use tables for comparisons.
- Use code blocks with language tags.
- Bold important keywords.
- Keep answers visually structured.
- Never return plain wall-of-text paragraphs.

Never:
- Spam emojis.
- Put emojis in every sentence.
- Use unrelated emojis.`
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
