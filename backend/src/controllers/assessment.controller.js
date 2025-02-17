import Assessment from "../models/assessment.model.js";

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