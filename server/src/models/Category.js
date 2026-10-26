import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true, maxlength: 60 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '', maxlength: 300 },
    icon: { type: String, default: 'BookOpen', maxlength: 40 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model('Category', categorySchema);
