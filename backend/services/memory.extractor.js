import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

class MemoryExtractor {
  constructor() {
    this.model = new ChatGoogleGenerativeAI({
      model: "gemini-3.5-flash",
      apiKey: process.env.GOOGLE_API_KEY,
    });
  }

  async extractMemory(message, currentMemories) {
    const formattedMemories = currentMemories.map(m => ({
      key: m.key,
      value: m.value,
      category: m.category,
      importance: m.importance
    }));

    const systemPrompt = `You are an AI Memory Extractor.
Your job is to analyze the user's latest message and determine if it contains new, updated, or deleted long-term information about the user.

Categories of interest and example keys:
- name (category: "profile", importance: 10)
- profession (category: "career", importance: 9)
- skills (category: "career", importance: 8)
- career_goals (category: "career", importance: 8)
- preferred_tech_stack (category: "tech_stack", importance: 8)
- learning_interests (category: "interests", importance: 7)
- project_interests (category: "interests", importance: 7)
- communication_preferences (category: "preferences", importance: 6)

Rules:
1. Extract ONLY facts, preferences, or details that are useful over the long term. Do NOT extract temporary queries, greetings, short-lived tasks, or casual conversational filler.
2. Do NOT extract information about the AI; only extract information about the user.
3. If the user mentions forgetting or deleting information (e.g. "Forget my name", "Forget my profession", "Delete all memories"), capture that request.
4. Compare the new message against the user's current memories (provided below) to resolve conflicts:
   - If the user changes an existing detail (e.g. they say they are now a Backend Engineer instead of MERN Developer), update the value.
   - If it's a new detail, add it.
   - If they ask to forget a specific key, identify it.

Current Memories:
${JSON.stringify(formattedMemories, null, 2)}

You must return a valid JSON object with the following structure. Do not include any markdown wrapper or explanation. Just return the raw JSON:
{
  "memories": [
    {
      "key": "string (lowercase snake_case matching one of the keys of interest, e.g. name, profession, preferred_tech_stack)",
      "value": "string (the consolidated/new value)",
      "category": "string (profile / career / tech_stack / interests / preferences)",
      "importance": number (1 to 10)
    }
  ],
  "deletions": [
    "string (keys to delete, e.g. 'name', 'profession')"
  ],
  "deleteAll": boolean (true if the user requested to forget or delete all memories/information)
}
`;

    try {
      const response = await this.model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(`User message: "${message}"`),
      ]);

      let text = response.content;
      // Strip markdown code block wrappers if the model returned them
      if (text.startsWith("```")) {
        text = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      }

      const parsed = JSON.parse(text);
      return this.validateExtractedData(parsed);
    } catch (err) {
      console.error("Error in MemoryExtractor:", err);
      return null;
    }
  }

  validateExtractedData(data) {
    if (!data || typeof data !== "object") return null;

    const result = {
      memories: [],
      deletions: [],
      deleteAll: false,
    };

    if (Array.isArray(data.memories)) {
      for (const item of data.memories) {
        if (
          item &&
          typeof item.key === "string" &&
          item.key.trim() &&
          typeof item.value === "string" &&
          item.value.trim() &&
          typeof item.category === "string" &&
          item.category.trim()
        ) {
          const importance = Number(item.importance);
          result.memories.push({
            key: item.key.trim().toLowerCase(),
            value: item.value.trim(),
            category: item.category.trim().toLowerCase(),
            importance: isNaN(importance)
              ? 5
              : Math.max(1, Math.min(10, importance)),
          });
        }
      }
    }

    if (Array.isArray(data.deletions)) {
      for (const key of data.deletions) {
        if (typeof key === "string" && key.trim()) {
          result.deletions.push(key.trim().toLowerCase());
        }
      }
    }

    if (typeof data.deleteAll === "boolean") {
      result.deleteAll = data.deleteAll;
    }

    return result;
  }
}

export default new MemoryExtractor();
