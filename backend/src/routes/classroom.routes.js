import express from "express"
import { protectRoute } from "../middlewares/auth.middleware.js"
import { createClassrooms, getClassrooms, uploadMaterials, getClassroomMaterials, createAssignment, getClassroomAssignments, getClassroomMembers, deleteClassroom, StudentGetClassrooms , JoinClassroom } from "../controllers/classroom.controller.js"
import multer from "multer"
const classroomRouter = express.Router()
const storage = multer.memoryStorage();
const upload = multer({ storage }); 
/* mentioning the routes */

 
classroomRouter.post("/create-classroom",protectRoute,createClassrooms);
classroomRouter.post("/:id/add-assignment",protectRoute,createAssignment);
classroomRouter.get("/all",protectRoute,getClassrooms);
classroomRouter.get("/s/all",protectRoute,StudentGetClassrooms);
classroomRouter.get("/:id",protectRoute,getClassroomMaterials)
classroomRouter.get("/:id/assignments",protectRoute,getClassroomAssignments)
classroomRouter.get("/:id/members",protectRoute,getClassroomMembers)
classroomRouter.delete("/:id/delete",protectRoute,deleteClassroom)
classroomRouter.post("/join",protectRoute,JoinClassroom);

classroomRouter.post("/:classroomId/upload",protectRoute,upload.array("files", 10),uploadMaterials)
export default classroomRouter; 