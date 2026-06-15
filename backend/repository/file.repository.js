import FileModel from "../model/file.model.js";
import ChunkModel from "../model/chunk.model.js";

class FileRepository {
  async findFilesByUserId(userId) {
    return await FileModel.find({ userId }).sort({ createdAt: -1 });
  }

  async findFilesByIds(userId, ids) {
    return await FileModel.find({ _id: { $in: ids }, userId });
  }

  async createFile(fileData) {
    return await FileModel.create(fileData);
  }

  async updateFileStatus(id, status) {
    return await FileModel.findByIdAndUpdate(
      id,
      { processingStatus: status },
      { new: true }
    );
  }

  async deleteFileById(userId, id) {
    const file = await FileModel.findOneAndDelete({ _id: id, userId });
    if (file) {
      await ChunkModel.deleteMany({ fileId: id });
    }
    return file;
  }

  async saveChunks(chunksData) {
    return await ChunkModel.insertMany(chunksData);
  }

  async findChunksByFileIds(userId, fileIds) {
    return await ChunkModel.find({ fileId: { $in: fileIds }, userId })
      .populate("fileId", "fileName");
  }
}

export default new FileRepository();
