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
import { GraduationCap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const StudentClassrooms = () => {
  const { idToken } = useAuthStore();
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

  return (
    <div className="p-6">
      <h2 className="text-3xl font-extrabold mb-6 text-gray-800">
        📚 Classrooms
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {classrooms.map((classroom) => (
          <Card
          onClick={()=>navigate(`/student/dashboard/c/${classroom._id}`)}
            key={classroom._id}
            className="relative bg-white/80 backdrop-blur-lg shadow-lg rounded-xl overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300"
          >
            {/* Banner Image */}
            <div className="h-40 w-full relative">
              <img
                src={
                  classroom.bannerImage ||
                  "https://picsum.photos/1200/300?classroom"
                }
                alt={`Banner for ${classroom.name}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent"></div>
            </div>

            {/* Content */}
            <CardHeader className="p-5">
              <CardTitle className="text-xl font-semibold text-gray-900">
                {classroom.name}
              </CardTitle>
              <CardDescription className="text-gray-600 line-clamp-2">
                {classroom.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={
                      classroom.creatorPhoto ||
                      "https://ui-avatars.com/api/?name=Unknown&background=random"
                    }
                    alt={classroom.createdBy|| "Unknown"}
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

    
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudentClassrooms;
