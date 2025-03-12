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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
      await axiosInstance.delete(`/${id}/delete`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      toast.success("Classroom deleted successfully!");
      set((state) => ({
        classrooms: state.classrooms.filter((c) => c._id !== id),
      }));
    } catch (error) {
      console.error("Error deleting classroom:", error);
      toast.error(error.response?.data?.message || "Failed to delete classroom");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">My Classrooms</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {classrooms.map((classroom) => (
          <Card
            key={classroom._id}
            className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-transform transform hover:scale-[1.02] bg-white border"
          >
            {/* Banner Image */}
            <div className="relative h-40 w-full">
              <img
                src={classroom.bannerImage || "https://picsum.photos/1200/300?classroom"}
                alt={`Banner for ${classroom.name}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <h3 className="text-lg sm:text-xl font-semibold text-white drop-shadow-lg text-center">
                  {classroom.name}
                </h3>
              </div>

              {/* Delete Button - Positioned in the top-right corner */}
              <button
                onClick={() => deleteClassroom(classroom._id)}
                className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-500 hover:text-white transition"
              >
                <Trash2 size={20} />
              </button>
            </div>

            {/* Classroom Details */}
            <CardContent className="p-4">
              <p className="text-gray-600 text-sm">{classroom.description}</p>

              {/* Created By - Profile Image + Name */}
              <div className="flex items-center gap-1 mt-4">
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={classroom?.createdBy?.photoURL || "https://via.placeholder.com/40"}
                    alt={classroom?.createdBy?.fullName}
                  />
                  <AvatarFallback>
                    {classroom?.createdBy?.fullName?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{classroom?.createdBy?.fullName || "Unknown"}</span>
                </p>
              </div>
            </CardContent>

            {/* Footer: Manage Classroom Button */}
            <CardFooter className="p-4 border-t bg-gray-50 flex justify-between items-center">
              <Link
                to={`/teacher/dashboard/c/${classroom._id}`}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-2 font-medium transition-colors"
              >
                Manage Classroom
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path>
                </svg>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Classrooms;
