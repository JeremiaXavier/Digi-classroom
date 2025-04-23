import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
import { GraduationCap, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";

const StudentClassrooms = () => {
  const { idToken,authUser } = useAuthStore();
  const [classrooms, setClassrooms] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const response = await axiosInstance.get("/c/s/all", {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        const data = await response.data;
        setClassrooms(data);
      } catch (error) {
        console.error("Error fetching classrooms:", error);
      }
    };

    fetchClassrooms();
  }, [idToken]);
  const handleRemoveMember = async (classroomId) => {
    try {
      
      const response = await axiosInstance.delete(`/c/${classroomId}/exit-classroom`, {
        data: { memberId:authUser._id }, // Correct way to pass body in DELETE request
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      toast.success("Exited from classroom successfully");

      // Update the UI by filtering out the removed member
      
    } catch (error) {
      console.error("Error happened:", error);
      toast.error(error.response?.data?.message || "Cannot exit from classroom");
    }
  };
  return (
    <div className="p-6">
      <h2 className="text-3xl font-extrabold mb-6 text-gray-800">
        📚 Classrooms
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {classrooms.map((classroom) => (
          <Card
            onClick={() => navigate(`/student/dashboard/c/${classroom._id}`)}
            key={classroom._id}
            className="relative group bg-white shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 rounded-xl overflow-hidden border border-gray-200 cursor-pointer"
          >
            {/* Banner Image */}
            <div className="h-40 w-full overflow-hidden relative">
              <img
                src={classroom.bannerUrl}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent"></div>
            </div>

            {/* Content */}
            <CardHeader className="p-6 bg-gradient-to-r from-[#af47e8] to-[#7a1cbf] text-white ">
              <CardTitle className="text-xl font-semibold">
                {classroom.name}
              </CardTitle>
              <CardDescription className="text-sm opacity-90 text-white">
                {classroom.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={
                      classroom.creatorPhoto ||
                      "https://ui-avatars.com/api/?name=Unknown&background=random"
                    }
                    alt={classroom.createdBy || "Unknown"}
                  />
                  <AvatarFallback>
                    {classroom.createdBy?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">
                  {classroom.createdBy || "Unknown"}
                </span>
              </div>
            </CardContent>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                  <MoreVertical size={20} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleRemoveMember(classroom._id)}
                >
                  Exit from classroom
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudentClassrooms;
