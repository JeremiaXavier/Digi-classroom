    import express from "express";
    import { protectRoute } from "../../middlewares/auth.middleware.js";
import { closeAssignment, createAssignment, deleteAssignment, getAssignmentById, getAssignmentsByClassroom,  } from "../../controllers/assignment/assignment.controller.js";
    import {upload} from "../../middlewares/assignment/upload.middleware.js"
    const assignmentRouter = express.Router();
    
    assignmentRouter.post("/create",protectRoute,createAssignment);
    assignmentRouter.get("/c/:classroomId",protectRoute,getAssignmentsByClassroom);
    assignmentRouter.get("/:id",protectRoute,getAssignmentById);
    assignmentRouter.post("/:id/close",protectRoute,closeAssignment);
    assignmentRouter.delete("/:assignmentId/delete",protectRoute,deleteAssignment)
    /*assignmentRouter.post("/:id/submit",protectRoute,submitAssignment);
    assignmentRouter.post("/:id/submissions",protectRoute,getSubmissionsByAssignment); */
    export default assignmentRouter;
    