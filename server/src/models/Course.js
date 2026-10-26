import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 5, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    shortDescription: { type: String, default: '', maxlength: 200 },
    description: { type: String, required: true, maxlength: 5000 },
    thumbnail: { type: String, default: '', maxlength: 500 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner', index: true },
    learningObjectives: { type: [{ type: String, maxlength: 200 }], default: [] },
    prerequisites: { type: [{ type: String, maxlength: 200 }], default: [] },
    price: { type: Number, default: 0, min: 0 },
    language: { type: String, default: 'English', maxlength: 40 },
    status: { type: String, enum: ['draft', 'published', 'suspended'], default: 'draft', index: true },
    isFeatured: { type: Boolean, default: false },
    // Denormalised counters, kept in sync by the lesson, enrollment and review services.
    lessonsCount: { type: Number, default: 0, min: 0 },
    durationMinutes: { type: Number, default: 0, min: 0 },
    enrollmentCount: { type: Number, default: 0, min: 0 },
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    publishedAt: { type: Date },
  },
  { timestamps: true },
);

courseSchema.index({ status: 1, createdAt: -1 });
courseSchema.index({ status: 1, enrollmentCount: -1 });
courseSchema.index({ status: 1, ratingAvg: -1 });
courseSchema.index({ status: 1, category: 1, level: 1, price: 1 });

export default mongoose.model('Course', courseSchema);
