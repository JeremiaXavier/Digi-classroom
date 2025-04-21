import mongoose from "mongoose";

const malpracticeLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment", required: true },
  violationType: { type: String, required: true }, // e.g., "Fullscreen Exit", "Tab Switch"
  timestamp: { type: Date, default: Date.now },
  details: { type: String }, // Additional info if needed
  isSuspended: { type: Boolean, default: false }, // Suspension flag
  actionTaken: {type: String, enum: ["Answers reset", "no action taken","Suspended from all examinations"], default:"no action taken"}
});

export const MalpracticeLog = mongoose.model("MalpracticeLog", malpracticeLogSchema);
