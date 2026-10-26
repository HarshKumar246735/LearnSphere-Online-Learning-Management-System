import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    status: { type: String, enum: ['in_progress', 'submitted', 'expired'], default: 'in_progress' },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    answers: { type: [Number], default: [] },
    correctCount: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
  },
  { timestamps: true },
);
schema.index({ quiz: 1, student: 1, status: 1 });

export default mongoose.model('QuizAttempt', schema);
