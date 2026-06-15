import { PDFParse } from "pdf-parse";
import fs from "fs";
import embeddingService from "./embedding.service.js";
import fileRepository from "../repository/file.repository.js";

class PdfProcessor {
  async processPdf(file) {
    try {
      const dataBuffer = fs.readFileSync(file.storagePath);
      const pagesText = [];

      // Custom page-by-page rendering function to preserve page numbers
      await pdfParse(dataBuffer, {
        pagerender: function (pageData) {
          return pageData.getTextContent().then(function (textContent) {
            let lastY, text = "";
            for (let item of textContent.items) {
              if (lastY === item.transform[5] || !lastY) {
                text += item.str;
              } else {
                text += "\n" + item.str;
              }
              lastY = item.transform[5];
            }
            
            pagesText.push({
              pageNumber: pageData.pageIndex + 1,
              text: text,
            });
            return text;
          });
        },
      });

      const chunks = [];
      const chunkSize = 800;
      const chunkOverlap = 150;

      for (const page of pagesText) {
        const text = page.text;
        const pageNum = page.pageNumber;

        if (!text || !text.trim()) continue;

        let start = 0;
        while (start < text.length) {
          const end = Math.min(start + chunkSize, text.length);
          const content = text.substring(start, end).trim();

          if (content.length > 50) {
            chunks.push({
              content,
              pageNumber: pageNum,
            });
          }

          start += chunkSize - chunkOverlap;
        }
      }

      if (chunks.length === 0) {
        throw new Error("No readable text found in PDF document.");
      }

      // Generate embeddings in batches of 10 to protect API rate limits
      const batchSize = 10;
      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        const texts = batch.map((c) => c.content);
        const embeddings = await embeddingService.getEmbeddings(texts);

        for (let j = 0; j < batch.length; j++) {
          batch[j].embedding = embeddings[j];
        }
      }

      // Write vector chunks to database
      await fileRepository.saveChunks(
        chunks.map((c) => ({
          fileId: file._id,
          userId: file.userId,
          content: c.content,
          pageNumber: c.pageNumber,
          embedding: c.embedding,
        }))
      );

      // Successfully processed!
      await fileRepository.updateFileStatus(file._id, "completed");
    } catch (error) {
      console.error("PDF processing failed:", error);
      await fileRepository.updateFileStatus(file._id, "failed");
    }
  }
}

export default new PdfProcessor();
