import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  key: { type: String, default: 'platform', unique: true },
  allowRegistrations: { type: Boolean, default: true },
  announcement: { type: String, default: '', maxlength: 240 },
});

export async function getSettings() {
  return mongoose.model('Setting').findOneAndUpdate({ key: 'platform' }, { $setOnInsert: { key: 'platform' } }, { upsert: true, new: true });
}

export default mongoose.model('Setting', schema);
