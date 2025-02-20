import Assessment from "../models/assessment.model.js";
import Member from "../models/members.models.js";
import Classroom from "../models/classrooms.model.js";

export const createAssessment = async(req,res)=>{
    try {
        const { title, questions } = req.body;
    
        const newAssessment = new Assessment({
          title,
          createdBy:req.user._id,
          questions,
        });
    
        await newAssessment.save();
        res.status(201).json({ message: "Assessment created successfully", newAssessment });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
}

export const getAssessments = async(req,res) =>{
  try {
    const assessment = await Assessment.find({createdBy:req.user._id});
    if(assessment.length>0){
      res.status(200).json({message:"successfully fetched",assessment});

    }
   
  } catch (error) {
    res.status(500).json({message:error.message});
  }
}

export const getStudentAssessments=async(req,res)=>{
  try {
    const userId = req.user.id;

    // Find classrooms where the user is a student
    const enrolledClasses = await Member.find({ userId, role: "student" }).select("classroomId");

    // Extract classroom IDs
    const classroomIds = enrolledClasses.map((member) => member.classroomId);

    // Find assessments assigned to those classrooms
    const assessments = await Assessment.find({ assignedClassrooms: { $in: classroomIds } });

    res.status(200).json({message:"success",assessments});
  } catch (error) {
    res.status(500).json({ message: "Error fetching assessments",error:error.message });
  }
}

export const assignAssessment = async(req,res)=>{
  try {
    const userId = req.user._id;
    const { assessmentId, classroomIds } = req.body;

    if (!assessmentId || !classroomIds || classroomIds.length === 0) {
      return res.status(400).json({ message: "Invalid data. Please provide an assessment ID and at least one classroom ID." });
    }

    // Update the assessment by adding multiple classrooms
    const updatedAssessment = await Assessment.findByIdAndUpdate(
      assessmentId,
      { $addToSet: { assignedClassrooms: { $each: classroomIds } } }, // Prevents duplicate classroom assignments
      { new: true }
    );

    if (!updatedAssessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    res.status(200).json({ message: "Assessment assigned successfully!", assessment: updatedAssessment });
    } catch (error) {
    res.status(500).json({error:error.message});
  }
}

export const getQuestionsForExamination = async(req,res)=>{
  try {
    const {id} = req.params;
    
    const assessment = await Assessment.findById(id).select("title questions");

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    // Process questions to remove answers from paragraph questions
    const filteredQuestions = assessment.questions.map((q) => {
      return {
        type: q.type,
        paragraph: q.paragraph, // Keep the paragraph if it exists
        question: q.question,
        choices: q.type === "mcq" ? q.choices : undefined, // Include choices for MCQs
        isMultiple: q.isMultiple, // Include if it's a multiple-answer MCQ
      };
    });

    res.status(200).json({
      assessmentTitle: assessment.title,
      questions: filteredQuestions,
    });

  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}