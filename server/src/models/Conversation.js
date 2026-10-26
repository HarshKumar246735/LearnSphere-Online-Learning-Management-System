import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    participants: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], validate: (v) => v.length === 2 },
    pairKey: { type: String, required: true, unique: true },
    lastMessage: {
      text: String,
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      at: Date,
    },
  },
  { timestamps: true },
);
schema.index({ participants: 1, 'lastMessage.at': -1 });

export default mongoose.model('Conversation', schema);
