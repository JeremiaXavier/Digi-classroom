import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  testId: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  answers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment.questions" },
      userAnswer: mongoose.Schema.Types.Mixed, // Stores text or selected choices
      marks: { type: Number, default: 0 },
    },
  ],
  totalMarks: { type: Number, default: 0 },
  status: { type: String, enum: ["submitted", "review_pending"], default: "submitted" },
  submittedAt: { type: Date, default: Date.now },
});

const Submission = mongoose.model("Submission", submissionSchema);
export default Submission;
