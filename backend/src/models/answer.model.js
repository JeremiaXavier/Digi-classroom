import mongoose from "mongoose";

const AnswerSchema = new mongoose.Schema({
  testId: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  answers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
      isMultiple: { type: Boolean, default: false },
      answerId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Choice" }], // Stores selected choices
      paragraphAnswer: { type: String, default: "" },
      marks: { type: Number, default: 0 }, // Stores paragraph answers
    },
  ],
 
});

const Answer = mongoose.model("Answer", AnswerSchema);
export default Answer;
