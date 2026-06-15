import memoryService from "../services/memory.service.js";
import memoryRepository from "../repository/memory.repository.js";

export async function getMemories(req, res) {
  try {
    const memories = await memoryService.getMemoriesForUser(req.userId);
    return res.status(200).json({
      success: true,
      memories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve memories",
      error: error.message,
    });
  }
}

export async function createMemory(req, res) {
  try {
    const { key, value, category, importance } = req.body;
    if (!key || !value || !category) {
      return res.status(400).json({
        success: false,
        message: "Key, value, and category are required.",
      });
    }

    const memory = await memoryRepository.createOrUpdate(req.userId, key.trim().toLowerCase(), {
      value: value.trim(),
      category: category.trim().toLowerCase(),
      importance: importance ? Number(importance) : 5,
    });

    return res.status(201).json({
      success: true,
      message: "Memory created/updated successfully",
      memory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create memory",
      error: error.message,
    });
  }
}

export async function updateMemory(req, res) {
  try {
    const { id } = req.params;
    const { value, category, importance } = req.body;

    const dataToUpdate = {};
    if (value !== undefined) dataToUpdate.value = value.trim();
    if (category !== undefined) dataToUpdate.category = category.trim().toLowerCase();
    if (importance !== undefined) dataToUpdate.importance = Number(importance);

    const memory = await memoryRepository.updateById(req.userId, id, dataToUpdate);
    if (!memory) {
      return res.status(404).json({
        success: false,
        message: "Memory not found or unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Memory updated successfully",
      memory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update memory",
      error: error.message,
    });
  }
}

export async function deleteMemory(req, res) {
  try {
    const { id } = req.params;
    const deleted = await memoryRepository.deleteById(req.userId, id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Memory not found or unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Memory deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete memory",
      error: error.message,
    });
  }
}

export async function clearAllMemories(req, res) {
  try {
    await memoryRepository.deleteAllByUserId(req.userId);
    return res.status(200).json({
      success: true,
      message: "All memories deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete memories",
      error: error.message,
    });
  }
}
