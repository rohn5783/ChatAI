import fs from "fs";
import fileRepository from "../repository/file.repository.js";
import pdfProcessor from "../services/pdf.processor.js";

export async function uploadFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded or file rejected by validator.",
      });
    }

    const { originalname, mimetype, size, path: filePath } = req.file;

    // Create File database record
    const file = await fileRepository.createFile({
      userId: req.userId,
      fileName: originalname,
      fileType: mimetype,
      fileSize: size,
      storagePath: filePath,
      processingStatus: mimetype === "application/pdf" ? "processing" : "completed",
    });

    // If PDF, process in background
    if (mimetype === "application/pdf") {
      pdfProcessor.processPdf(file).catch((err) => {
        console.error("Async background PDF processing crashed:", err);
      });
    }

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully.",
      file,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "File upload failed.",
      error: error.message,
    });
  }
}

export async function getFiles(req, res) {
  try {
    const files = await fileRepository.findFilesByUserId(req.userId);
    return res.status(200).json({
      success: true,
      files,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve uploaded files.",
      error: error.message,
    });
  }
}

export async function deleteFile(req, res) {
  try {
    const { id } = req.params;
    const file = await fileRepository.deleteFileById(req.userId, id);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found or unauthorized.",
      });
    }

    // Physically delete from file system
    if (fs.existsSync(file.storagePath)) {
      fs.unlinkSync(file.storagePath);
    }

    return res.status(200).json({
      success: true,
      message: "File and indexes deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete file.",
      error: error.message,
    });
  }
}
