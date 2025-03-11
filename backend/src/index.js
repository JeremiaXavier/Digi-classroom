import express from "express";
import authRoutes from "./routes/auth.routes.js";
import { connectDb } from "./lib/db.js";
import cors from "cors"; 
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import classroomRoutes from "./routes/classroom.routes.js";
import assessmentRouter from "./routes/assessment.routes.js";
import assignmentRouter from "./routes/assignment/assignment.routes.js";

const app = express();

// Load environment variables from .env file
dotenv.config();

// CORS Middleware Setup - Place this at the top to handle all routes
app.use(cors({
  origin: ["http://localhost:5173",process.env.CLIENT_URL],  // Allow frontend URL
  credentials: true,  // Allow cookies and authorization headers
  methods: ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT'], // Allow necessary HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], // Allow headers
}));

// Handle preflight request
app.options('*', cors()); // Handle CORS preflight request for all routes
app.use(express.json()); // To parse incoming JSON requests
app.use(express.urlencoded({ extended: true }));
// Middleware to handle cookies and JSON requests
app.use(cookieParser()); 
app.use("/uploads", express.static("uploads"));

// Routes for authentication
app.use("/api/auth", authRoutes);
app.use("/api/c",classroomRoutes);
app.use("/api/assess",assessmentRouter);
app.use("/api/work",assignmentRouter);
// Start the server and connect to the database
app.listen(process.env.PORT,process.env.HOST, () => {
  console.log("Server started at http://192.168.200.199:5001");
  connectDb(); // Connect to your database
});
