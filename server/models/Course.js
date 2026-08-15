import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required']
    },
    description: {
      type: String,
      default: ''
    },
    creator: {
      type: String,
      required: false,
      default: 'guest',
      index: true,
    },
    modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

export default mongoose.model('Course', courseSchema);