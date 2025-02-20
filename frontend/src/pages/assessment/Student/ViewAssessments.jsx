import React, { useEffect, useState } from "react";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/store/auth-slice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

const StudentAssessments = () => {
  const [assessments, setAssessments] = useState([]);
  const { idToken } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const response = await axiosInstance.get("/assess/s/view", {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        setAssessments(response.data.assessments);
      } catch (error) {
        toast.error("Failed to load assessments");
      }
    };

    fetchAssessments();
  }, [idToken]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📖 Assigned Assessments</h1>
      {assessments.length > 0 ? (
        <ul className=" flex space-y-4">
          {assessments.map((assessment) => (
            <li
              key={assessment._id}
              className="p-4 bg-white shadow-md rounded-lg cursor-pointer hover:bg-gray-100"
              
            >
              <h2 className="text-lg font-semibold">{assessment.title}</h2>
              <p className="text-gray-500">Created on: {new Date(assessment.createdAt).toLocaleDateString()}</p>
            <Button className="mt-2" onClick={() => navigate(`/assessment/s/start/${assessment._id}`)}>Start Exam</Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No assessments assigned yet.</p>
      )}
    </div>
  );
};

export default StudentAssessments;
