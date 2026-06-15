import MemoryModel from "../model/memory.model.js";

class MemoryRepository {
  async findByUserId(userId) {
    return await MemoryModel.find({ userId }).sort({ createdAt: -1 });
  }

  async findByUserAndKey(userId, key) {
    return await MemoryModel.findOne({ userId, key });
  }

  async createOrUpdate(userId, key, memoryData) {
    return await MemoryModel.findOneAndUpdate(
      { userId, key },
      {
        userId,
        key,
        value: memoryData.value,
        category: memoryData.category,
        importance: memoryData.importance,
      },
      { new: true, upsert: true }
    );
  }

  async updateById(userId, id, data) {
    return await MemoryModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: data },
      { new: true }
    );
  }

  async deleteById(userId, id) {
    return await MemoryModel.findOneAndDelete({ _id: id, userId });
  }

  async deleteByKey(userId, key) {
    return await MemoryModel.findOneAndDelete({ userId, key });
  }

  async deleteAllByUserId(userId) {
    return await MemoryModel.deleteMany({ userId });
  }
}

export default new MemoryRepository();
