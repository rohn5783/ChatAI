import memoryRepository from "../repository/memory.repository.js";
import memoryExtractor from "./memory.extractor.js";

class MemoryService {
  async getMemoriesForUser(userId) {
    return await memoryRepository.findByUserId(userId);
  }

  async processMessageForMemory(userId, message) {
    try {
      const currentMemories = await memoryRepository.findByUserId(userId);
      
      const extracted = await memoryExtractor.extractMemory(message, currentMemories);
      if (!extracted) return;

      const { memories, deletions, deleteAll } = extracted;

      if (deleteAll) {
        await memoryRepository.deleteAllByUserId(userId);
        return;
      }

      if (deletions && deletions.length > 0) {
        for (const key of deletions) {
          await memoryRepository.deleteByKey(userId, key);
        }
      }

      if (memories && memories.length > 0) {
        for (const item of memories) {
          await memoryRepository.createOrUpdate(userId, item.key, {
            value: item.value,
            category: item.category,
            importance: item.importance,
          });
        }
      }
    } catch (error) {
      console.error("Memory extraction/update failed:", error);
      // Fail-safe: don't crash the conversation flow
    }
  }

  async getMemoriesContext(userId) {
    const memories = await memoryRepository.findByUserId(userId);
    if (!memories || memories.length === 0) return "";

    return memories
      .map((m) => {
        const formattedKey = m.key
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
        return `- ${formattedKey}: ${m.value}`;
      })
      .join("\n");
  }
}

export default new MemoryService();
