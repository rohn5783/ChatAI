import mongoose from 'mongoose';

const memorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    key: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    importance: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },
  },
  { timestamps: true }
);

// Unique index to prevent duplicate keys for the same user
memorySchema.index({ userId: 1, key: 1 }, { unique: true });

const MemoryModel = mongoose.model('Memory', memorySchema);

export default MemoryModel;
