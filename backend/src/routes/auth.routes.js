import express from "express"
import { checkAuth, login, signup,updateProfile, updateRole } from "../controllers/auth.controller.js"
import { protectRoute } from "../middlewares/auth.middleware.js"
import { createClassrooms } from "../controllers/classroom.controller.js"
const authRouter = express.Router()

/* mentioning the routes */

authRouter.post("/signup",signup)

authRouter.post("/login",login)

authRouter.patch("/update-role",protectRoute,updateRole)

authRouter.put("/update-profile",protectRoute,updateProfile);/* here protectRoute is a middleware */

authRouter.get("/check",protectRoute,checkAuth);
 



export default authRouter; 
