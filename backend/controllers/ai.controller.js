import { generateSingleResponse } from "../services/ai.service.js";

export async function askAI(req, res) {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please send a non-empty message.",
      });
    }

    const answer = await generateSingleResponse(message.trim());

    return res.status(200).json({
      success: true,
      question: message.trim(),
      answer,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "AI response failed",
      error: error.message,
    });
  }
}
