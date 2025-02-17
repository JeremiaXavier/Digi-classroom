import express from "express";
import authRoutes from "./routes/auth.routes.js";
import { connectDb } from "./lib/db.js";
import cors from "cors"; 
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import classroomRoutes from "./routes/classroom.routes.js";
import assessmentRouter from "./routes/assessment.routes.js";

const app = express();

// Load environment variables from .env file
dotenv.config();

// CORS Middleware Setup - Place this at the top to handle all routes
app.use(cors({
  origin: "http://localhost:5173",  // Allow frontend URL
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

// Routes for authentication
app.use("/api/auth", authRoutes);
app.use("/api/c",classroomRoutes);
app.use("/api/assess",assessmentRouter);
// Start the server and connect to the database
app.listen(5001, () => {
  console.log("Server started at http://localhost:5001");
  connectDb(); // Connect to your database
});
