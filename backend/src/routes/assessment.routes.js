import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { createAssessment } from "../controllers/assessment.controller.js";

const assessmentRouter = express.Router();

assessmentRouter.post("/create",protectRoute,createAssessment);


export default assessmentRouter;
