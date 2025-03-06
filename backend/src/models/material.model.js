import mongoose from "mongoose";

const classroomMaterialSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  fileUrls: [{ type: String }],  // Array of file URLs
  publicIds: [{ type: String }],  // Array of public IDs
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject"}, // Reference to Subject
  classroomId: { type: mongoose.Schema.Types.ObjectId, ref: "Classroom", required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },  
}, { timestamps: true });

export default mongoose.model("ClassroomMaterial", classroomMaterialSchema);
