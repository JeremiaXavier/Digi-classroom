import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // Subject Name (Unique to avoid duplicates)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Classroom",
      required: true, // Ensures every subject belongs to a classroom
    }, // Teacher who created the subject
  },
  { timestamps: true }
);

export default mongoose.model("Subject", subjectSchema);
