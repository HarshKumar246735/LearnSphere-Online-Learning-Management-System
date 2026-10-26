import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    order: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

sectionSchema.index({ course: 1, order: 1 });

export default mongoose.model('Section', sectionSchema);
