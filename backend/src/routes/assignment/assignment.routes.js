    import express from "express";
    import { protectRoute } from "../../middlewares/auth.middleware.js";
import { closeAssignment, createAssignment, deleteAssignment, getAllSubmissionsForAssignment, getAssignmentById, getAssignmentsByClassroom, getMySubmission, gradeSubmission, submitAssignment,  } from "../../controllers/assignment/assignment.controller.js";

    const assignmentRouter = express.Router();
    
    assignmentRouter.post("/create",protectRoute,createAssignment);
    assignmentRouter.post("/:assignmentId/submit",protectRoute,submitAssignment);
    assignmentRouter.get("/:assignmentId/isSubmitted",protectRoute,getMySubmission);
    assignmentRouter.get("/c/:classroomId",protectRoute,getAssignmentsByClassroom);
    assignmentRouter.get("/:id",protectRoute,getAssignmentById);
    assignmentRouter.post("/:id/close",protectRoute,closeAssignment);
    assignmentRouter.delete("/:assignmentId/delete",protectRoute,deleteAssignment)
    assignmentRouter.get("/:assignmentId/viewall",protectRoute,getAllSubmissionsForAssignment);
    assignmentRouter.post("/:submissionId/grade",protectRoute,gradeSubmission);

    /*assignmentRouter.post("/:id/submit",protectRoute,submitAssignment);
    assignmentRouter.post("/:id/submissions",protectRoute,getSubmissionsByAssignment); */
    export default assignmentRouter;
    