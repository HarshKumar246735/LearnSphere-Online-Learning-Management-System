import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    description: { type: String, default: '', maxlength: 3000 },
    youtubeVideoId: { type: String, default: '', match: /^[A-Za-z0-9_-]{11}$|^$/ },
    isShort: { type: Boolean, default: false },
    durationMinutes: { type: Number, default: 0, min: 0 },
    isPreview: { type: Boolean, default: false },
    resources: {
      type: [{ label: { type: String, maxlength: 80 }, url: { type: String, maxlength: 500 } }],
      default: [],
    },
    order: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

lessonSchema.index({ course: 1, order: 1 });
lessonSchema.index({ section: 1, order: 1 });

export default mongoose.model('Lesson', lessonSchema);
