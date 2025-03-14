import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Unique category name
});

const Category = mongoose.model("Category", categorySchema);
export default Category;
