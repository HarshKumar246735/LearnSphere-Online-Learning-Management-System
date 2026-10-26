import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, maxlength: 1500 },
    isHidden: { type: Boolean, default: false },
  },
  { timestamps: true },
);
schema.index({ course: 1, _id: -1 });

export default mongoose.model('DiscussionMessage', schema);
