import Classroom from "../../models/classrooms.model.js";
import ClassroomMaterial from "../../models/material.model.js";
import cloudinary from "../../lib/cloudinary.js";
import Member from "../../models/members.models.js";
import Assignment from "../../models/assignment.model.js";
import Subject from "../../models/subject.model.js";
import mongoose from "mongoose";
import { upload } from "../../middlewares/materials/upload.middleware.js";
import fs from "fs";
import path from "path";

export const createClassrooms = async (req, res) => {
  const { name, description } = req.body;

  try {
    // Check if the user is authorized (from the auth middleware)
    if (!req.user || req.user.role !== "teacher") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // Create a new classroom instance
    const newClassroom = new Classroom({
      name,
      description,
      createdBy: req.user._id, // reference the creator from the authenticated user's id
    });

    // Save the classroom to the database
    await newClassroom.save();

    return res.status(201).json({
      message: "Classroom created successfully",
      classroom: newClassroom,
    });
  } catch (error) {
    console.error("Error creating classroom:", error.message);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const getClassrooms = async (req, res) => {
  const userId = req.user?._id; // Safely access userId from req.user
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized access" });
  }

  try {
    if (req.user.role !== "teacher") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // Fetch created classrooms
    const createdClassrooms = await Classroom.find({
      createdBy: userId,
    }).lean();
    const createdClassroomsWithRole = createdClassrooms.map((classroom) => ({
      ...classroom,
      role: "teacher",
      createdBy: { name: "you" },
    }));

    // Fetch joined classrooms with populated data
    const joinedClassrooms = await Member.find({ userId })
      .populate("classroomId", "name description createdBy")
      .populate({
        path: "classroomId",
        populate: {
          path: "createdBy",
          select: "fullName", // Select only the name from the 'createdBy' user
        },
      });

    const joinedClassroomsWithRole = joinedClassrooms.map((member) => ({
      ...member.classroomId,
      role: member.role,
      createdBy: member.classroomId.createdBy?.name || null, // Use optional chaining
    }));

    // Merge all classrooms into one array and remove duplicates by _id
    const allClassrooms = [
      ...joinedClassroomsWithRole,
      ...createdClassroomsWithRole,
    ];
    const uniqueClassrooms = Array.from(
      new Map(allClassrooms.map((item) => [item._id.toString(), item])).values()
    );

    res.status(200).json(uniqueClassrooms);
  } catch (error) {
    console.error("Error fetching classrooms with roles:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const StudentGetClassrooms = async (req, res) => {
  try {
    const userId = req.user?._id; // Safely access userId from req.user
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    // Fetch joined classrooms with populated data
    const joinedClassrooms = await Member.find({ userId })
      .populate({
        path: "classroomId",
        select: "name description createdBy",
        populate: {
          path: "createdBy",
          select: "fullName",
        },
      })
      .lean(); // Convert Mongoose documents to plain objects

    // Map to include the role
    const formattedClassrooms = joinedClassrooms
      .map((member) => {
        if (!member.classroomId) return null; // Handle cases where classroomId is missing
        return {
          _id: member.classroomId._id,
          name: member.classroomId.name,
          description: member.classroomId.description,
          createdBy: member.classroomId.createdBy?.fullName || "Unknown",
          role: member.role,
        };
      })
      .filter(Boolean); // Remove any null values

    res.status(200).json(formattedClassrooms);
  } catch (error) {
    console.error("Error fetching enrolled classrooms:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* not completed */
export const getClassroomMaterials = async (req, res) => {
  try {
    const { id } = req.params; // Extract classroom ID from URL params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid classroom ID from classroom Details get function" });
    }
    // Fetch materials from the database for the given classroom
    const materials = await ClassroomMaterial.find({ classroomId:id })
      .populate("uploadedBy", "fullName email photoURL") // Populate user details (if needed)
      .sort({ createdAt: -1 }); // Sort by latest first

    // Check if materials exist
    if (!materials.length) {
      return res
        .status(404)
        .json({ message: "No materials found for this classroom." });
    }

    res.status(200).json({ materials });
  } catch (error) {
    console.error("Error fetching classroom materials:", error.message);
    res
      .status(500)
      .json({ message: "Failed to fetch materials in getClassroomMaterials", error: error.message });
  }
};

/* export const getClassroomAssignments = async (req, res) => {
  const { id } = req.params;
  try {
    const assignments = await Assignment.find({ classroomId: id })
      .populate("createdBy", "fullName email photoURL") // Populate user details (if needed)
      .sort({ createdAt: -1 });
    if (!assignments.length) {
      return res
        .status(404)
        .json({ message: "No assignments found for this classroom." });
    }
    res.status(200).json({ assignments });
  } catch (error) {
    console.error("Error fetching classroom Assignments:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch aSSIGNMENTS", error: error.message });
  }
}; */

export const getClassroomMembers = async (req, res) => {
  const { id } = req.params;
  try {
    const members = await Member.find({ classroomId: id })
      .populate("userId", "fullName email photoURL") // Populate user details (if needed)
      .sort({ createdAt: -1 });

    const classroom = await Classroom.findById(id).populate(
      "createdBy",
      "fullName email photoURL"
    );

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found." });
    }

    // Combine members & creator
    const creator = classroom.createdBy;
    const allMembers = creator
      ? [
          {
            _id: creator._id,
            fullName: creator.fullName,
            email: creator.email,
            photoURL: creator.photoURL,
          },
          ...members.map((m) => ({
            _id: m.userId._id,
            fullName: m.userId.fullName,
            email: m.userId.email,
            photoURL: m.userId.photoURL,
          })),
        ]
      : members.map((m) => ({
          _id: m.userId._id,
          fullName: m.userId.fullName,
          email: m.userId.email,
          photoURL: m.userId.photoURL,
        }));

    res.status(200).json({ allMembers });
  } catch (error) {
    console.error("Error fetching classroom memebers:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch members", error: error.message });
  }
};

export const uploadMaterials = async (req, res) => {
  /* try {
    const userId = req.user._id;
    const { title, description, subjectId } = req.body;
    const files = req.files;

    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ error: "Invalid subjectId" });
    }
    if (!userId) return res.status(400).json({ message: "User ID is empty" });
    if (!files?.length || !title || !description) {
      return res.status(400).json({
        message: "All fields (title, description, files) are required.",
      });
    }

    // Function to upload files to Cloudinary
    const uploadFile = (file) => {
      return new Promise((resolve, reject) => {
        const isImage = file.mimetype.startsWith("image"); // Check if the file is an image
        const resourceType = isImage ? "image" : "raw"; // Use "raw" for documents

        cloudinary.uploader
          .upload_stream(
            {
              folder: "classroom_materials",
              resource_type: resourceType, // Use "raw" for xlsx, pdf, docx
              use_filename: true,
              unique_filename: false,
              allowed_formats: ["pdf", "doc", "docx", "xlsx", "jpeg", "png"],
            },
            (error, result) => {
              if (error) {
                console.error("Cloudinary upload error:", error);
                reject(error);
              } else {
                resolve(result.secure_url);
              }
            }
          )
          .end(file.buffer);
      });
    };

    // Upload all files concurrently
    const uploadedUrls = await Promise.all(files.map(uploadFile));

    // Save uploaded materials to the database
    const savedMaterials = await ClassroomMaterial.create({
      title,
      description,
      fileUrls: uploadedUrls,
      subjectId,
      classroomId: req.params.classroomId,
      uploadedBy: userId,
    });

    res.status(201).json({
      message: "Materials uploaded successfully",
      materials: savedMaterials,
    });
  } catch (error) {
    console.error("Error in uploadMaterials controller:", error);
    res
      .status(500)
      .json({ message: "Failed to upload materials", error: error.message });
  } */

      try {
        upload(req, res, async (err) => {
          if (err) {
            return res.status(400).json({ message: err.message });
          }
    
          const userId = req.user._id;
          const { title, description, subjectId } = req.body;
          const files = req.files;
    
          if (!files?.length || !title || !description) {
            return res.status(400).json({
              message: "All fields (title, description, files) are required.",
            });
          }
    
          const fileUrls = files.map((file) => {
            // Clean the filename by removing spaces and converting to lowercase
            const cleanFilename = file.filename.replace(/\s+/g, "_").toLowerCase();
      
            return `http://localhost:5001/uploads/materials/${cleanFilename}`;
          });
    
          // Save uploaded materials to the database
          const savedMaterials = await ClassroomMaterial.create({
            title,
            description,
            fileUrls,
            subjectId,
            classroomId: req.params.classroomId,
            uploadedBy: userId,
          });
    
          res.status(201).json({
            message: "Materials uploaded successfully",
            materials: savedMaterials,
          });
        });
      } catch (error) {
        console.error("Error in uploadMaterials controller:", error);
        res.status(500).json({ message: "Failed to upload materials", error: error.message });
      }


};

export const deleteMaterials = async (req, res) => {
  try {
    const { materialId } = req.params;

    // Find the material
    const material = await ClassroomMaterial.findById(materialId);
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    // Delete associated files
    if (material.fileUrls && material.fileUrls.length > 0) {
      material.fileUrls.forEach((filePath) => {
        const absolutePath = path.join(
          process.cwd(),
          "uploads/materials",
          path.basename(filePath) // Extracts just the filename
        );

        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath); // Delete the file
        }
      });
    }

    // Delete the material from the database
    await ClassroomMaterial.findByIdAndDelete(materialId);

    res.status(200).json({ message: "Material and files deleted successfully" });
  } catch (error) {
    console.error("Error deleting material:", error);
    res.status(500).json({ message: "Internal Server Error",error:error.message });
  }
};
export const deleteClassroom = async (req, res) => {
  const { id } = req.params;
  try {
    await Classroom.findByIdAndDelete({ _id: id });
    return res.status(200).json({ message: " deleted classroom successfuly" });
  } catch (error) {
    return res.status(400).json({ message: "cannot delete classroom", error });
  }
};

export const JoinClassroom = async (req, res) => {
  try {
    const userId = req.user?._id; // Get user ID from request (assuming authentication middleware)
    const { code } = req.body; // Get joinCode from request body
    const joinCode = code;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    if (!code) {
      return res.status(400).json({ error: "Join code is required" });
    }

    // Find classroom by joinCode
    const classroom = await Classroom.findOne({ joinCode });
    if (!classroom) {
      return res.status(404).json({ error: "Invalid classroom code" });
    }

    // Check if user is already a member
    const existingMember = await Member.findOne({
      userId,
      classroomId: classroom._id,
    });

    if (existingMember) {
      return res
        .status(400)
        .json({ error: "You are already in this classroom" });
    }

    // Add user to classroom members
    const newMember = new Member({
      userId,
      classroomId: classroom._id,
      role: "student", // Default role
    });

    await newMember.save();

    res.status(200).json({ message: "Successfully joined the classroom" });
  } catch (error) {
    console.error("Error joining classroom:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getSubjects = async (req, res) => {
  try {
    const { classroomId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(classroomId)) {
      return res.status(400).json({ message: "Invalid classroom ID" });
    }

    const subjects = await Subject.find({ classroomId });

    res.status(200).json({ subjects });
  } catch (error) {
    console.error("Error fetching subjects:", error.message);
    res.status(500).json({ message: "Failed to fetch subjects" });
  }
};

export const addSubject = async (req, res) => {
  try {
    const { name, classroomId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(classroomId)) {
      return res.status(400).json({ message: "Invalid classroom ID" });
    }

    // Check if the subject already exists in this classroom
    const existingSubject = await Subject.findOne({ name, classroomId });
    if (existingSubject) {
      return res.status(400).json({ message: "Subject already exists in this classroom" });
    }

    const newSubject = new Subject({ name, classroomId,createdBy:req.user._id });
    await newSubject.save();

    res.status(201).json({ message: "Subject added successfully", subject: newSubject });
  } catch (error) {
    console.error("Error adding subject:", error.message);
    res.status(500).json({ message: "Failed to add subject" });
  }
};
