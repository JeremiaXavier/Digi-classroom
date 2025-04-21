import express from "express";
import { protectRoute, scorepilotAuth } from "../middlewares/auth.middleware.js";
import { addCategory, assignAssessment, createAssessment, deleteAssessment, EvaluateAnswers, getAssessments, getCategories, getGradesByAssessment, getGradesByUser, getMalpracticeLogsForAssessment, getQuestionsForExamination, getStudentAnswers, getStudentAnswersReview, getStudentAssessments, getStudentsAttended, getStudentScoreboard, malpracticeAction, removeClassroomFromAssessment, removeSuspension, saveStudentAnswer, setMalpracticeLog, studentExitExam, suspendStudent, updateGrade, uploadAssessmentImage } from "../controllers/assessment/assessment.controller.js";
import { MalpracticeLog } from "../models/malpracticelog.model.js";

const assessmentRouter = express.Router();

assessmentRouter.post("/create",protectRoute,createAssessment);
assessmentRouter.get("/view",protectRoute,getAssessments);
assessmentRouter.get("/s/view",scorepilotAuth,getStudentAssessments);
assessmentRouter.post("/assign",protectRoute,assignAssessment);
assessmentRouter.get("/s/:id",scorepilotAuth,getQuestionsForExamination)
assessmentRouter.post("/submit",scorepilotAuth,EvaluateAnswers);
assessmentRouter.get("/answers/:testId/:userId",scorepilotAuth,getStudentAnswers);
assessmentRouter.get("/student/:userId/:testId",protectRoute,getStudentAnswersReview);
assessmentRouter.delete("/delete-answers/:userId/:testId",scorepilotAuth,malpracticeAction);
assessmentRouter.post("/remove/:assessmentId/:classroomId",protectRoute,removeClassroomFromAssessment);
assessmentRouter.get("/review/:assessmentId",protectRoute,getStudentsAttended);
assessmentRouter.post("/save-answer",scorepilotAuth,saveStudentAnswer);
assessmentRouter.post("/student-close",scorepilotAuth,studentExitExam);
assessmentRouter.post("/update",protectRoute,updateGrade);
assessmentRouter.post("/upload/image",protectRoute,uploadAssessmentImage);
assessmentRouter.post("/add-category",protectRoute,addCategory);
assessmentRouter.get("/get-category",protectRoute,getCategories);
assessmentRouter.get("/grades/a/:assessmentId",protectRoute,getGradesByAssessment);
assessmentRouter.get("/grades/u/:userId",protectRoute,getGradesByUser);
assessmentRouter.get("/scoreboard/:userId",scorepilotAuth,getStudentScoreboard);
assessmentRouter.post("/log",scorepilotAuth,setMalpracticeLog);
assessmentRouter.get("/getlog/:testId",protectRoute,setMalpracticeLog);
assessmentRouter.get("/malpractice/:assessmentId",protectRoute,getMalpracticeLogsForAssessment);

assessmentRouter.delete("/:assessmentId/delete",protectRoute,deleteAssessment);
assessmentRouter.post("/suspend/:logId",protectRoute,suspendStudent);
assessmentRouter.post("/remove-suspension/:logId",protectRoute,removeSuspension);

export default assessmentRouter;
