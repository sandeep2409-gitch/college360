import mongoose from 'mongoose';

const TimetableSchema = new mongoose.Schema({
  className: { type: String, required: true, unique: true },
  data: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

export default mongoose.models.Timetable || mongoose.model('Timetable', TimetableSchema);
