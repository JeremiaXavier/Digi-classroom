import mongoose from "mongoose";

const GradeSchema = new mongoose.Schema(
  {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mcqScore: { type: Number, default: 0 }, // Auto-graded MCQ score
    manualScore: { type: Number, default: 0 }, // To be updated manually for paragraph questions
    totalScore: { type: Number, default: 0 }, // Sum of MCQ + Manual scores

    correctAnswers: { type: Number, default: 0 }, // ✅ Count of correct MCQs
    incorrectAnswers: { type: Number, default: 0 }, // ❌ Count of incorrect MCQs
    totalMcqQuestions: { type: Number, default: 0 },

    status: { type: String, enum: ["pending", "graded"], default: "pending" }, // Manual grading status
  },
  { timestamps: true }
);

export default mongoose.model("Grade", GradeSchema);
