import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useStore } from "zustand";
import { classroomStore } from "../../store/classroomStore";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/store/auth-slice";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const Classrooms = () => {
  const { classrooms, set } = useStore(classroomStore);
  const { idToken } = useAuthStore();

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const response = await axiosInstance.get("/c/all", {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        const data = await response.data;
        set({ classrooms: data });
      } catch (error) {
        console.error("Error fetching classrooms:", error);
      }
    };

    fetchClassrooms();
  }, []);

const deleteClassroom=async(id)=>{
  if (!window.confirm("Are you sure you want to delete this classroom?")) return;

  try {
    await axiosInstance.delete(`/${id}/delete`, {
      headers: {
        Authorization: `Bearer ${idToken}`, // Replace with actual token
      },
    });

    toast.success("Classroom deleted successfully!");
  } catch (error) {
    console.error("Error deleting classroom:", error);
    toast.error(error.response?.data?.message || "Failed to delete classroom");
  }
}
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Classrooms</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classrooms.map((classroom) => (
          <Card key={classroom._id} className="hover:shadow-lg transition-shadow rounded-lg overflow-hidden">
          {/* Banner Image */}
          <div className="h-32 w-full overflow-hidden relative">
            <img
              src={classroom.bannerImage || "https://picsum.photos/1200/300?classroom"}
              alt={`Banner for ${classroom.name}`}
              className="w-full h-full object-cover"
            />
    
            {/* Delete Button - Positioned in the top-right corner */}
            <button
              onClick={()=>deleteClassroom(classroom._id)}
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-red-500 hover:text-white transition"
            >
              <Trash2 size={18} />
            </button>
          </div>
    
          <CardHeader className="p-4">
            <CardTitle>{classroom.name}</CardTitle>
            <CardDescription>{classroom.description}</CardDescription>
          </CardHeader>
    
          <CardContent className="p-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">Created by: {classroom.createdBy.name}</p>
          </CardContent>
    
          <CardFooter className="p-4 flex justify-between">
            <Link to={`/teacher/dashboard/c/${classroom._id}`} className="text-blue-500 hover:underline">
              Manage Classroom
            </Link>
          </CardFooter>
        </Card>
        ))}
      </div>
    </div>
  );
};

export default Classrooms;
