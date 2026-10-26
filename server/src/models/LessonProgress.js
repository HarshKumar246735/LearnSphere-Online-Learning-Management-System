import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);
schema.index({ student: 1, lesson: 1 }, { unique: true });
schema.index({ student: 1, course: 1 });
schema.index({ student: 1, completedAt: -1 });

export default mongoose.model('LessonProgress', schema);
