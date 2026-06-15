import { generateResponse, generateChatTitle } from "../services/ai.service.js";
import chatModel from "../model/chat.model.js";
import messageModel from "../model/message.model.js";
import memoryService from "../services/memory.service.js";
import fileRepository from "../repository/file.repository.js";
import retrievalService from "../services/retrieval.service.js";
import imageProcessor from "../services/image.processor.js";

export async function sendMessage(req, res) {
  try {
    const message = req.body.message?.trim();
    let chatId = req.body.chatId || req.body.chat;
    const fileIds = req.body.fileIds || [];

    if (!message) {
      return res.status(400).json({
        message: "Please send a non-empty message.",
        success: false,
      });
    }

    let title = null;
    let chat = null;

    if (!chatId) {
      title = await generateChatTitle(message);
      chat = await chatModel.create({
        user: req.userId,
        title,
      });
      chatId = chat._id;
    } else {
      chat = await chatModel.findOne({
        _id: chatId,
        user: req.userId,
      });

      if (!chat) {
        return res.status(404).json({
          message: "Chat not found",
          success: false,
        });
      }
    }

    const userMessage = await messageModel.create({
      chat: chatId,
      content: message,
      role: "user",
      files: fileIds,
    });

    // Extract and update memories from the user's message
    await memoryService.processMessageForMemory(req.userId, message);

    const messages = await messageModel.find({ chat: chatId });

    // Retrieve updated user memories
    const memories = await memoryService.getMemoriesForUser(req.userId);

    // Retrieve file contexts (semantic text chunks for PDFs, and base64 for images)
    let fileContext = "";
    const imageAttachments = [];

    if (fileIds && fileIds.length > 0) {
      const files = await fileRepository.findFilesByIds(req.userId, fileIds);
      const pdfFileIds = files
        .filter((f) => f.fileType === "application/pdf")
        .map((f) => f._id);
      const imageFiles = files.filter((f) => f.fileType.startsWith("image/"));

      // 1. Get semantic chunks for PDFs
      if (pdfFileIds.length > 0) {
        fileContext = await retrievalService.retrieveRelevantChunks(
          req.userId,
          pdfFileIds,
          message
        );
      }

      // 2. Load images as base64
      for (const img of imageFiles) {
        try {
          const base64Data = await imageProcessor.getBase64Image(img.storagePath);
          imageAttachments.push({
            mimeType: img.fileType,
            base64Data,
          });
        } catch (err) {
          console.error("Skipped image attachment in AI response due to read error:", err);
        }
      }
    }

    // Generate response incorporating memories, PDF semantic chunks, and images
    const result = await generateResponse(messages, memories, fileContext, imageAttachments);

    const aiMessage = await messageModel.create({
      chat: chatId,
      content: result,
      role: "ai",
    });

    chat = await chatModel.findByIdAndUpdate(
      chatId,
      { updatedAt: new Date() },
      { new: true }
    );

    res.status(201).json({
      title,
      chat,
      chatId,
      userMessage: await userMessage.populate("files", "fileName fileType fileSize"),
      aiMessage,
    });
  } catch (error) {
    res.status(500).json({
      message: "AI response failed",
      success: false,
      error: error.message,
    });
  }
}

export async function getChats(req, res) {
  const chats = await chatModel.find({ user: req.userId }).sort({ updatedAt: -1 });

  res.status(200).json({
    message: "Chats retrieved successfully",
    chats,
  });
}

export async function getMessages(req, res) {
  const { chatId } = req.params;

  const chat = await chatModel.findOne({
    _id: chatId,
    user: req.userId,
  });

  if (!chat) {
    return res.status(404).json({
      message: "Chat not found",
    });
  }

  const messages = await messageModel.find({
    chat: chatId,
  }).populate("files", "fileName fileType fileSize");

  res.status(200).json({
    message: "Messages retrieved successfully",
    messages,
  });
}

export async function deleteChat(req, res) {
  const { chatId } = req.params;

  const chat = await chatModel.findOneAndDelete({
    _id: chatId,
    user: req.userId,
  });

  await messageModel.deleteMany({
    chat: chatId,
  });

  if (!chat) {
    return res.status(404).json({
      message: "Chat not found",
    });
  }

  res.status(200).json({
    message: "Chat deleted successfully",
  });
}
