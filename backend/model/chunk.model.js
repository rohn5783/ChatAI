import mongoose from "mongoose";

const chunkSchema = new mongoose.Schema(
  {
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    pageNumber: {
      type: Number,
    },
    embedding: {
      type: [Number],
      required: true,
    },
  },
  { timestamps: true }
);

const ChunkModel = mongoose.model("Chunk", chunkSchema);

export default ChunkModel;
