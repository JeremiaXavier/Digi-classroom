import { upload } from "../../middlewares/assignment/upload.middleware.js";
import Assignment from "../../models/assignment.model.js";
import Submission from "../../models/submission.model.js";
import fs from "fs";
import path from "path";
//************************************************ASSIGNMENT CONTROLLERS*******************************************************
export const createAssignment = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      const { title, description, dueDate, classroomId } = req.body;

      if (!title || !dueDate || !classroomId) {
        return res.status(400).json({
          success: false,
          message: "Title, Due Date, and Classroom ID are required.",
        });
      }

      // Extract file paths from uploaded files
      const attachments = req.files
        ? req.files.map(
            (file) =>
              `http://localhost:5001/uploads/assignment/${file.filename}`
          )
        : [];

      // Create a new assignment document
      const newAssignment = new Assignment({
        title,
        description,
        dueDate,
        classroomId,
        createdBy: req.user.id,
        attachments, // Store file paths in the database
      });

      await newAssignment.save();

      res.status(201).json({ success: true, assignment: newAssignment });
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAssignmentsByClassroom = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const { status } = req.query; // Optional filter (e.g., ?status=closed)

    // Query based on classroom ID & optional status filter
    const query = { classroomId };
    if (status) query.status = status; // Apply status filter if provided

    const assignments = await Assignment.find(query)
      .populate("createdBy", "fullName email photoURL") // Populate teacher details
      .sort({ dueDate: 1 }); // Sort by nearest due date

    if (!assignments.length) {
      return res.status(404).json({
        success: false,
        message: "No assignments found for this classroom.",
      });
    }

    res.status(200).json({ success: true, assignments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get all assignments
export const deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    // Check if assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Delete associated files
    if (assignment.attachments && assignment.attachments.length > 0) {
      assignment.attachments.forEach((filePath) => {
        const absolutePath = path.join(
          process.cwd(),
          "uploads/assignment",
          filePath.split("/").pop()
        );
        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath); // Delete the file
        }
      });
    }
    // Delete the assignment
    await Assignment.findByIdAndDelete(assignmentId);

    res.status(200).json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Get a single assignment by ID
export const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment)
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });

    res.json(assignment);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Stop receiving submissions for an assignment
export const closeAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { status: "closed" },
      { new: true }
    );

    if (!assignment)
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });

    res.json({ success: true, message: "Submissions closed", assignment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

//*******************************************************SUBMISSSION CONTROLLERS*******************************************************

// ✅ Submit an assignment
export const submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment)
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });

    if (assignment.status === "closed") {
      return res.status(403).json({
        success: false,
        message: "Submissions are closed for this assignment",
      });
    }

    const files = req.files.map(
      (file) => `/uploads/submissions/${file.filename}`
    );

    const newSubmission = new Submission({
      assignmentId: req.params.id,
      studentId: req.user.id,
      files,
    });

    await newSubmission.save();
    res.status(201).json({ success: true, submission: newSubmission });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get student's submission for an assignment
export const getMySubmission = async (req, res) => {
  try {
    const submission = await Submission.findOne({
      assignmentId: req.params.id,
      studentId: req.user.id,
    });

    if (!submission)
      return res
        .status(404)
        .json({ success: false, message: "No submission found" });

    res.json(submission);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get all submissions for an assignment
export const getAllSubmissionsForAssignment = async (req, res) => {
  try {
    const submissions = await Submission.find({
      assignmentId: req.params.id,
    }).populate("studentId", "fullName email");
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Grade a submission
export const gradeSubmission = async (req, res) => {
  try {
    const { grade, feedback } = req.body;

    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { grade, feedback, gradedBy: req.user.id },
      { new: true }
    );

    res.json({ success: true, submission });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
