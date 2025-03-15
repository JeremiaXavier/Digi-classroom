import { useEffect } from "react";
import {  useNavigate } from "react-router-dom";
import { useStore } from "zustand";
import { classroomStore } from "../../store/classroomStore";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/store/auth-slice";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const Classrooms = () => {
  const { classrooms, set } = useStore(classroomStore);
  const { idToken } = useAuthStore();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const response = await axiosInstance.get("/c/all", {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        set({ classrooms: response.data });
      } catch (error) {
        console.error("Error fetching classrooms:", error);
      }
    };

    fetchClassrooms();
  }, []);

  const deleteClassroom = async (id) => {
    if (!window.confirm("Are you sure you want to delete this classroom?")) return;
    try {
      await axiosInstance.delete(`/c/${id}/delete`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      toast.success("Classroom deleted successfully!");
      set({ classrooms: classrooms.filter((c) => c._id !== id) });
    } catch (error) {
      console.error("Error deleting classroom:", error);
      toast.error(error.response?.data?.message || "Failed to delete classroom");
    }
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      <h2 className="text-2xl font-bold  mb-8 text-start">Your Classrooms</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {classrooms.map((classroom) => (
          <Card
            key={classroom._id}
            onClick={() => navigate(`/teacher/dashboard/c/${classroom._id}`)} // Clickable card
            className="relative group bg-white shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 rounded-xl overflow-hidden border border-gray-200 cursor-pointer"
          >
            {/* Banner Image */}
            <div className="h-40 w-full overflow-hidden relative">
              <img
                src={classroom.bannerUrl || "https://picsum.photos/1200/300?classroom"}
                alt={`Banner for ${classroom.name}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent navigation when deleting
                  deleteClassroom(classroom._id);
                }}
                className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-red-500 hover:text-white transition-all"
              >
                <Trash2 size={22} />
              </button>
            </div>

            {/* Classroom Info */}
            <CardHeader className="p-6 bg-gradient-to-r from-[#af47e8] to-[#7a1cbf] text-white ">
              <CardTitle className="text-xl font-semibold">{classroom.name}</CardTitle>
              <CardDescription className="text-sm opacity-90 text-white">{classroom.description}</CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              <p className="text-sm text-gray-600">
                Created by: <span className="font-semibold">{classroom.createdBy.fullName}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
export default Classrooms;
