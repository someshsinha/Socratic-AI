import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    objectives: [String],

    // TODO: RESTORE BEFORE PRODUCTION - Set required: true once Stage 2 generation runs
    content: {
      type: [mongoose.Schema.Types.Mixed],
      required: false,
      default: []
    },

    isEnriched: { type: Boolean, default: false },
    module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
  },
  { timestamps: true }
);

export default mongoose.model('Lesson', lessonSchema);