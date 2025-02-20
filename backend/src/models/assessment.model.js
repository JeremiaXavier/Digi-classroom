import mongoose from "mongoose";

const choiceSchema = new mongoose.Schema({
  text: { type: String, required: true }, // MCQ choices
  isCorrect: { type: Boolean, default: false }, // Marks correct choice
});

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["mcq", "paragraph"],
    required: true,
  },
  paragraph: {
    type: String, // Optional paragraph (for MCQ with reading material)
    default: "",
  },
  question: {
    type: String,
    required: true,
  },
  choices: {
    type: [choiceSchema], // Only for MCQs
    default: undefined,
  },
  isMultiple:{
    type:Boolean,
    default:false,
  },
  answer: {
    type: String, // Used for paragraph-based answers
    required: function () {
      return this.type === "paragraph";
    },
  },
});

const assessmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignedClassrooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Classroom" }], // Added this
  questions: { type: [questionSchema], required: true },
  createdAt: { type: Date, default: Date.now },
});

const Assessment = mongoose.model("Assessment", assessmentSchema);

export default Assessment;
