import mongoose from "mongoose";

const choiceSchema = new mongoose.Schema({
  text: { type: String, required: true }, // MCQ choice text
  isCorrect: { type: Boolean, default: false }, // Marks correct MCQ choices
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
    type: [choiceSchema], // Stores MCQ choices
    default: undefined,
  },
  isMultiple: {
    type: Boolean,
    default: false, // If true, MCQ allows multiple correct answers
  },
  answer: {
    type: String, // Only used for paragraph-based answers
    required: function () {
      return this.type === "paragraph";
    },
  },
  marks: {
    type: Number,
    default: 1, // Default marks per question
  },
});

const assessmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignedClassrooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Classroom" }], // Links assessments to classrooms
  questions: { type: [questionSchema], required: true },
  createdAt: { type: Date, default: Date.now },
});

const Assessment = mongoose.model("Assessment", assessmentSchema);

export default Assessment;
