import embeddingService from "./embedding.service.js";
import fileRepository from "../repository/file.repository.js";

function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

class RetrievalService {
  async retrieveRelevantChunks(userId, fileIds, queryText, limit = 5) {
    try {
      if (!fileIds || fileIds.length === 0) return "";

      const queryEmbedding = await embeddingService.getEmbedding(queryText);

      // Fetch chunks for selected files
      const chunks = await fileRepository.findChunksByFileIds(userId, fileIds);
      if (!chunks || chunks.length === 0) return "";

      // Compute cosine similarity scores
      const scoredChunks = chunks.map((chunk) => {
        const score = cosineSimilarity(queryEmbedding, chunk.embedding);
        return { chunk, score };
      });

      // Sort descending by similarity score
      scoredChunks.sort((a, b) => b.score - a.score);

      // Select top limit chunks
      const topChunks = scoredChunks.slice(0, limit);

      // Format as text context with metadata
      return topChunks
        .map(
          (item) =>
            `File: ${item.chunk.fileId?.fileName || "Document"} (Page ${
              item.chunk.pageNumber || 1
            })\nContent: ${item.chunk.content}`
        )
        .join("\n\n");
    } catch (err) {
      console.error("Retrieval process failed:", err);
      return "";
    }
  }
}

export default new RetrievalService();
