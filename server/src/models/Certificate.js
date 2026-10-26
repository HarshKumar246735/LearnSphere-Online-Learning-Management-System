import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    certificateId: { type: String, required: true, unique: true, uppercase: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    // Snapshots, so a certificate stays correct if a name or title changes later.
    studentName: { type: String, required: true },
    courseTitle: { type: String, required: true },
    instructorName: { type: String, required: true },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);
schema.index({ student: 1, course: 1 }, { unique: true });

export default mongoose.model('Certificate', schema);
