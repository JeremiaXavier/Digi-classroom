import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { addCategory, assignAssessment, createAssessment, deleteAssessment, EvaluateAnswers, getAssessments, getCategories, getQuestionsForExamination, getStudentAnswers, getStudentAnswersReview, getStudentAssessments, getStudentsAttended, removeClassroomFromAssessment, saveStudentAnswer, updateGrade, uploadAssessmentImage } from "../controllers/assessment/assessment.controller.js";

const assessmentRouter = express.Router();

assessmentRouter.post("/create",protectRoute,createAssessment);
assessmentRouter.get("/view",protectRoute,getAssessments);
assessmentRouter.get("/s/view",protectRoute,getStudentAssessments);
assessmentRouter.post("/assign",protectRoute,assignAssessment);
assessmentRouter.get("/s/:id",protectRoute,getQuestionsForExamination)
assessmentRouter.post("/submit",protectRoute,EvaluateAnswers);
assessmentRouter.get("/answers/:testId/:userId",protectRoute,getStudentAnswers);
assessmentRouter.get("/student/:userId/:testId",protectRoute,getStudentAnswersReview);
assessmentRouter.post("/remove/:assessmentId/:classroomId",protectRoute,removeClassroomFromAssessment);
assessmentRouter.get("/review/:assessmentId",protectRoute,getStudentsAttended);
assessmentRouter.post("/save-answer",protectRoute,saveStudentAnswer);
assessmentRouter.post("/update",protectRoute,updateGrade);
assessmentRouter.post("/upload/image",protectRoute,uploadAssessmentImage);
assessmentRouter.post("/add-category",protectRoute,addCategory);
assessmentRouter.get("/get-category",protectRoute,getCategories);

assessmentRouter.delete("/:assessmentId/delete",protectRoute,deleteAssessment);

export default assessmentRouter;
