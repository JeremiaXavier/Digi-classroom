import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Import ShadCN Avatar
import { Card, CardContent, CardFooter } from "@/components/ui/card"; // Import ShadCN Card
import { Link } from "react-router-dom";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/store/auth-slice";



const StudentClassrooms = () => {
  const { idToken } = useAuthStore();
  const [classrooms,setClassrooms] = useState([]);
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
    <h2 className="text-2xl font-bold mb-6 text-gray-900">Classrooms</h2>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {classrooms.map((classroom) => (
        <Card
          key={classroom._id}
          className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-transform transform hover:scale-[1.02] bg-white border"
        >
          {/* Banner Image with Overlay */}
          <div className="relative h-40 w-full">
            <img
              src={classroom.bannerImage || "https://picsum.photos/1200/300?classroom"}
              alt={`Banner for ${classroom.name}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <h3 className="text-xl md:text-2xl font-extrabold text-white drop-shadow-lg text-center">
                {classroom.name}
              </h3>
            </div>
          </div>

          {/* Classroom Details */}
          <CardContent className="p-4">
            <p className="text-gray-600 text-sm">{classroom.description}</p>

            {/* Created By (Profile Image + Name) */}
            <div className="flex items-center gap-3 mt-4">
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={classroom?.photoURL || "https://via.placeholder.com/40"}
                  alt={classroom?.fullName}
                />
                <AvatarFallback>
                  {classroom?.createdBy?.fullName?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm text-gray-700">
                Created by: <span className="font-medium">{classroom.createdBy	 || "Unknown"}</span>
              </p>
            </div>
          </CardContent>

          {/* Footer: Manage Classroom Button */}
          <CardFooter className="p-4  bg-white flex justify-between items-center">
            <Link
              to={`/student/dashboard/c/${classroom._id}`}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2 font-medium transition-colors"
            >
              Open
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

export default StudentClassrooms;
