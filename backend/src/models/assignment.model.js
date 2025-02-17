import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // This links to the user who created the assignment
    },
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom',
      required: true, // This links the assignment to a classroom
    },
    status: {
      type: String,
      enum: ['accepting', 'closed'], // 'accepting' or 'closed' statuses
      default: 'accepting',
    },
    
  },{
    timeStamps:true,
  });
  
  const Assignment = mongoose.model('Assignment', assignmentSchema);
  
  export default Assignment;
  