import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 3, maxlength: 60 },
    description: { type: String, default: '', maxlength: 200 },
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }, // when set, only people with access to the course can join
  },
  { timestamps: true },
);
schema.index({ createdAt: -1 });

export default mongoose.model('StudyRoom', schema);
