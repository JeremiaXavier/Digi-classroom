import React, { useState } from "react";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/auth-slice";

const CreateClassroom = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({ name: "", description: "" });
  const {idToken} = useAuthStore();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post("/c/create-classroom", formData, {
        headers: {
          Authorization: `Bearer ${idToken}`, // Correct usage
        },
      });
      toast.success("New classroom is created");
    } catch (error) {
      toast.error("Error creating classroom:", error);
    }

    // Save classroom using axiosInstance
  };

  // Render the modal only when `isOpen` is true
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4">Create Classroom</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Classroom Name"
            value={formData.name}
            onChange={handleChange}
            className="p-2 border rounded mb-2 w-full"
            required
          />
          <textarea
            name="description"
            placeholder="Classroom Description"
            value={formData.description}
            onChange={handleChange}
            className="p-2 border rounded mb-2 w-full"
            required
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClassroom;
