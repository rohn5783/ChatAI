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

export async function generateResponse(messages, memories = [], fileContext = "", imageAttachments = []) {
  const langchainMessages = messages.map((message, index) => {
    const content = message.content ?? "";
    const isLastMessage = index === messages.length - 1;

    // Convert last user message to multimodal content if images are attached
    if (isLastMessage && message.role === "user" && imageAttachments && imageAttachments.length > 0) {
      const contentList = [
        {
          type: "text",
          text: content,
        },
      ];

      for (const img of imageAttachments) {
        contentList.push({
          type: "image_url",
          image_url: `data:${img.mimeType};base64,${img.base64Data}`,
        });
      }

      return new HumanMessage({ content: contentList });
    }

    return message.role === "ai"
      ? new AIMessage(content)
      : new HumanMessage(content);
  });

  if (memories && memories.length > 0) {
    const memoryContext = memories
      .map((m) => {
        const formattedKey = m.key
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
        return `- ${formattedKey}: ${m.value}`;
      })
      .join("\n");

    langchainMessages.unshift(
      new SystemMessage(
        `User Profile Memory:\n${memoryContext}\n\nYou must use these memories naturally in your response if they are relevant to the conversation. If the user asks about themselves or their details, answer using this memory context. If they tell you to forget some details or if they tell you new details, acknowledge it.`
      )
    );
  }

  if (fileContext) {
    langchainMessages.unshift(
      new SystemMessage(
        `Below is the relevant text extracted from the uploaded PDF document(s). Use this context to answer the user's question. If the user refers to the document, base your answer on this text.
You must always cite the sources at the end of your response under a "Sources:" heading. Use the format:
Sources:
- [FileName] (Page [PageNumber])
Only cite the sources that were actually used to construct the answer.

PDF Document Context:
${fileContext}`
      )
    );
  }

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
