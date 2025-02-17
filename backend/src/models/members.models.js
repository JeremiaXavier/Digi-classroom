import mongoose from "mongoose";

const membersSchema = new mongoose.Schema(
    {
      classroomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom',
        required: true,
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      role: {
        type: String,
        enum: ['teacher', 'student'],  // Role can be either 'teacher' or 'student'
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );
  
  const Member = mongoose.model('Member', membersSchema);
  export default Member;
  