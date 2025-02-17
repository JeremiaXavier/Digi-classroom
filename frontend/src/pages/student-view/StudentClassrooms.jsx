import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
    
           
            
          </div>
    
          <CardHeader className="p-4">
            <CardTitle>{classroom.name}</CardTitle>
            <CardDescription>{classroom.description}</CardDescription>
          </CardHeader>
    
          <CardContent className="p-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">Created by: {classroom.createdBy.name}</p>
          </CardContent>
    
          <CardFooter className="p-4 flex justify-between">
            <Link to={`/student/dashboard/c/${classroom._id}`} className="text-blue-500 hover:underline">
              Manage Classroom
            </Link>
          </CardFooter>
        </Card>
        ))}
      </div>
    </div>
  );
};

export default StudentClassrooms;
