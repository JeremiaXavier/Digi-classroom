import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Classroom from "../../models/classrooms.model.js";
import subjectModel from "../../models/subject.model.js";
import Submission from "../../models/submission.model.js";
import Assignment from "../../models/assignment.model.js";
import Material from "../../models/material.model.js";
import Member from "../../models/members.models.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Helper function to delete files from folders
const deleteFiles = (filePaths, folder) => {
  filePaths.forEach((fileUrl) => {
    const filePath = path.join(__dirname, "..", "uploads", folder, path.basename(fileUrl));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });   
};

export const deleteClassroom = async (req, res) => {
  const { id } = req.params;

  try {
    const classroom = await Classroom.findById(id);

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    if (classroom.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this classroom" });
    }

    // Delete related members
    await Member.deleteMany({ classroomId: id });

    // Delete related assignments & their files
    const assignments = await Assignment.find({ classroomId: id });
    deleteFiles(assignments.flatMap((a) => a.attachments || []), "assignment");
    await Assignment.deleteMany({ classroomId: id });

    // Delete related materials & their files
    const materials = await Material.find({ classroomId: id });
    deleteFiles(materials.flatMap((m) => m.files || []), "materials");
    await Material.deleteMany({ classroomId: id });

    // Delete related submissions & their files
    const submissions = await Submission.find({ classroomId: id });
    deleteFiles(submissions.flatMap((s) => s.files || []), "submissions");
    await Submission.deleteMany({ classroomId: id });

    // Delete subjects containing classroomId
    await subjectModel.deleteMany({ classroomId: id });

    // Delete the classroom
    await Classroom.findByIdAndDelete(id);

    res.status(200).json({ message: "Classroom and all related data deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Error deleting classroom", error: error.message });
  }
};
