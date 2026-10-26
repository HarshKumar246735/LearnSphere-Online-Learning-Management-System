import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['message', 'announcement', 'course_update', 'quiz', 'enrollment', 'completion', 'certificate', 'system'], required: true },
    title: { type: String, required: true, maxlength: 140 },
    body: { type: String, default: '', maxlength: 500 },
    link: { type: String, default: '', maxlength: 300 },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
);
schema.index({ user: 1, createdAt: -1 });
schema.index({ user: 1, readAt: 1 });

export default mongoose.model('Notification', schema);
