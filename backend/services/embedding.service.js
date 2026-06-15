import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

class EmbeddingService {
  constructor() {
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,

      // Recommended
      model: "gemini-embedding-001",
    });
  }

  async getEmbedding(text) {
    try {
      return await this.embeddings.embedQuery(text);
    } catch (error) {
      console.error("Embedding generation failed:", error);
      throw error;
    }
  }

  async getEmbeddings(texts) {
    try {
      return await this.embeddings.embedDocuments(texts);
    } catch (error) {
      console.error("Batch embedding generation failed:", error);
      throw error;
    }
  }
}

export default new EmbeddingService();