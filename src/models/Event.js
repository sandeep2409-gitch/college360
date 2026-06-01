import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  location: { type: String },
  description: { type: String },
  type: { type: String },
}, { timestamps: true });

export default mongoose.models.Event || mongoose.model('Event', EventSchema);
