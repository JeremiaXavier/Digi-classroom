import express from "express"
import { protectRoute } from "../middlewares/auth.middleware.js"
import { createClassrooms, getClassrooms, uploadMaterials, getClassroomMaterials, getClassroomMembers, deleteClassroom, StudentGetClassrooms , JoinClassroom, getSubjects, addSubject, deleteMaterials } from "../controllers/classroom/classroom.controller.js"
import multer from "multer"
const classroomRouter = express.Router()
const storage = multer.memoryStorage();
const upload = multer({ storage }); 
/* mentioning the routes */

 
classroomRouter.post("/create-classroom",protectRoute,createClassrooms);
classroomRouter.get("/all",protectRoute,getClassrooms);
classroomRouter.get("/s/all",protectRoute,StudentGetClassrooms);
classroomRouter.get("/:id",protectRoute,getClassroomMaterials);
classroomRouter.get("/:id/members",protectRoute,getClassroomMembers);
classroomRouter.delete("/:id/delete",protectRoute,deleteClassroom);
classroomRouter.post("/join",protectRoute,JoinClassroom);
classroomRouter.get("/:classroomId/get-subjects",protectRoute,getSubjects);
classroomRouter.post("/add-subjects",protectRoute,addSubject);
classroomRouter.post("/:classroomId/upload",protectRoute,uploadMaterials)
classroomRouter.delete("/m/:materialId/delete",protectRoute,deleteMaterials)
export default classroomRouter; 