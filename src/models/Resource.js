import mongoose from 'mongoose';

const ResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String },
  fileUrl: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'pending' },
}, { timestamps: true });

export default mongoose.models.Resource || mongoose.model('Resource', ResourceSchema);
