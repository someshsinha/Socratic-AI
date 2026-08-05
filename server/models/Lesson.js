const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  objectives: [String],
  content: { type: [mongoose.Schema.Types.Mixed], required: true }, // block array, see Phase 2
  isEnriched: { type: Boolean, default: false }, // true once Stage 2 generation has run
  module: { type: mongoose.Schema.Types.ObjectId, ref: "Module" }
}, { timestamps: true });

module.exports = mongoose.model('Lesson', lessonSchema);
