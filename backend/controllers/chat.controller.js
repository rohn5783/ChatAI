import { generateResponse, generateChatTitle } from "../services/ai.service.js";
import chatModel from "../model/chat.model.js";
import messageModel from "../model/message.model.js";

export async function sendMessage(req, res) {
  const { message } = req.body;
  let chatId = req.body.chatId || req.body.chat;

  let title = null,
    chat = null;

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

  console.log("sendMessage:", { message, chatId: chatId.toString() });

  const userMessage = await messageModel.create({
    chat: chatId,
    content: message,
    role: "user",
  });

  const messages = await messageModel.find({ chat: chatId });

  const result = await generateResponse(messages);

  const aiMessage = await messageModel.create({
    chat: chatId,
    content: result,
    role: "ai",
  });

  res.status(201).json({
    title,
    chat,
    chatId,
    userMessage,
    aiMessage,
  });
}

export async function getChats(req, res) {
  const chats = await chatModel.find({ user: req.userId });

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
  });

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
