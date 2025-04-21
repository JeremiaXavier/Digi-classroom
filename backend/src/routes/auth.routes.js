import express from "express"
import { checkAuth, login, scorepilotAuthLogin, signup,updateProfile, updateRole } from "../controllers/authentication/auth.controller.js"
import { protectRoute, scorepilotAuth } from "../middlewares/auth.middleware.js"
const authRouter = express.Router()

/* mentioning the routes */

authRouter.post("/signup",signup)

authRouter.post("/login",login)

authRouter.patch("/update-role",protectRoute,updateRole)

authRouter.put("/update-profile",protectRoute,updateProfile);/* here protectRoute is a middleware */

authRouter.get("/check",protectRoute,checkAuth);
authRouter.get("/assessmentcheck",scorepilotAuth,checkAuth);
 
authRouter.get("/scorepilot-login",scorepilotAuthLogin);


export default authRouter; 
