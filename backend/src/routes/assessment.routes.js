import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { assignAssessment, createAssessment, getAssessments, getQuestionsForExamination, getStudentAssessments } from "../controllers/assessment.controller.js";

const assessmentRouter = express.Router();

assessmentRouter.post("/create",protectRoute,createAssessment);
assessmentRouter.get("/view",protectRoute,getAssessments);
assessmentRouter.get("/s/view",protectRoute,getStudentAssessments);
assessmentRouter.post("/assign",protectRoute,assignAssessment);
assessmentRouter.get("/s/:id",protectRoute,getQuestionsForExamination)
export default assessmentRouter;
