import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    clientId: { type: String, maxlength: 64 }, // lets a retry after a reconnect be recognised as a duplicate
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
);
schema.index({ conversation: 1, _id: -1 });
schema.index({ conversation: 1, sender: 1, readAt: 1 });
schema.index({ sender: 1, clientId: 1 }, { unique: true, partialFilterExpression: { clientId: { $type: 'string' } } });

export default mongoose.model('Message', schema);
