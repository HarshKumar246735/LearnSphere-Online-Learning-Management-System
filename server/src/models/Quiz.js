import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  prompt: { type: String, required: true, trim: true, maxlength: 500 },
  options: { type: [{ type: String, trim: true, maxlength: 200 }], validate: (v) => v.length >= 2 && v.length <= 6 },
  correctIndex: { type: Number, required: true, min: 0 },
  explanation: { type: String, default: '', maxlength: 500 },
});

const quizSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: '', maxlength: 500 },
    questions: { type: [questionSchema], validate: (v) => v.length >= 1 && v.length <= 50 },
    passingScore: { type: Number, default: 70, min: 1, max: 100 },
    timeLimitMinutes: { type: Number, default: 0, min: 0, max: 240 }, // 0 = no limit
    maxAttempts: { type: Number, default: 0, min: 0, max: 50 }, // 0 = unlimited
    isRequired: { type: Boolean, default: true }, // required quizzes must be passed to earn the certificate
    showAnswers: { type: Boolean, default: true }, // reveal correct answers and explanations after submitting
  },
  { timestamps: true },
);

export default mongoose.model('Quiz', quizSchema);
