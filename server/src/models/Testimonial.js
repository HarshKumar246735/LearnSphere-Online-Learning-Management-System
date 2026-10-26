import mongoose from 'mongoose';

// Testimonials are submitted by signed-in users and only appear publicly once an admin approves them.
const testimonialSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    quote: { type: String, required: true, trim: true, minlength: 20, maxlength: 400 },
    approved: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export default mongoose.model('Testimonial', testimonialSchema);
