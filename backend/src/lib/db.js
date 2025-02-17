import mongoose from "mongoose";

export const connectDb = async () =>{
 try {
    const conn = await mongoose.connect("mongodb://127.0.0.1:27017/classroomdb")
    console.log(`mongodb connected ${conn.connection.host}`)
 } catch (error) {
    console.log("cant connect to database");
 }
};