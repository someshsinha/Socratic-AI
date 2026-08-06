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
    // TODO: RESTORE BEFORE PRODUCTION - Set required: true and remove default once Auth0 is attached
    creator: {
      type: String,
      required: false,
      default: 'dev-temp-creator'
    },
    modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

export default mongoose.model('Course', courseSchema);