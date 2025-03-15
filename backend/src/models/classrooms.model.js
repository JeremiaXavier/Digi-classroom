import mongoose from "mongoose";
import { nanoid } from "nanoid";

const classroomsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    joinCode: {
      type: String,
      unique: true,
      default: () => nanoid(6),
    },
    bannerUrl: {
      type: String, // Store banner image URL
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Classroom = mongoose.model("Classroom", classroomsSchema);
export default Classroom;
