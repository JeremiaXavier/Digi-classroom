import mongoose from "mongoose";
import crypto from 'crypto'; 

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
    },
    photoURL: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["student", "teacher"],
      default: null,
    },
    uid: {
      type: String,
      required: true,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    examuserId: {
      type: String,
      unique: true, // Ensure uniqueness
    },
    otp: { 
        type: String, 
        required: true, // OTP is required for each assessment
        default: function() {
          // Generate a random 6-digit OTP
          return crypto.randomInt(100000, 999999).toString(); 
        },
      },
  },
  { timestamps: true }
);

// ✅ Function to generate a 12-digit unique `examuserId`
async function generateUniqueExamUserId() {
  let uniqueId;
  let isUnique = false;

  while (!isUnique) {
    uniqueId = Math.floor(100000000000 + Math.random() * 900000000000).toString(); // 12-digit random number
    const existingUser = await User.findOne({ examuserId: uniqueId });
    if (!existingUser) isUnique = true;
  }

  return uniqueId;
}

// ✅ Generate `examuserId` before saving a user
userSchema.pre("save", async function (next) {
  if (!this.examuserId) {
    this.examuserId = await generateUniqueExamUserId();
  }
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
