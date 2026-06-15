import fs from "fs";

class ImageProcessor {
  async getBase64Image(filePath) {
    try {
      const data = fs.readFileSync(filePath);
      return data.toString("base64");
    } catch (error) {
      console.error("Failed to read image file as base64:", error);
      throw error;
    }
  }
}

export default new ImageProcessor();
