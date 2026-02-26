import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  facultyName: { type: String },
  rating: { type: Number },
  comment: { type: String },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
