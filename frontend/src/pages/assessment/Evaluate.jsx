import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/store/auth-slice";
import toast from "react-hot-toast";

const Evaluate = () => {
  const [assessments, setAssessments] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const { idToken } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssessments = async () => {
        try {
          const response = await axiosInstance.get("/assess/view", {
            headers: { Authorization: `Bearer ${idToken}` },
          });
          if (response.status === 200) {
            setAssessments(response.data.assessment);
          }
        } catch (error) {
          toast.error("Failed to fetch assessments.");
        }
      };
    fetchAssessments();
  }, [idToken]);

  const handleSelectAssessment = async (assessmentId) => {
    try {
      const { data } = await axiosInstance.get(`/assess/review/${assessmentId}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      setStudents(data);
      setSelectedAssessment(assessmentId);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Evaluate Exams</h1>

      {/* Show Assessments if None Selected */}
      {!selectedAssessment ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assessments.map((assessment) => (
            <Card
            key={assessment._id}
            className="cursor-pointer hover:scale-105 hover:shadow-xl transition-all duration-300 ease-in-out bg-gradient-to-r from-[#6EE7B7] via-[#3B82F6] to-[#9333EA] rounded-xl shadow-lg overflow-hidden"
            onClick={() => handleSelectAssessment(assessment._id)}
          >
            <CardHeader className="p-5 text-center bg-white rounded-t-xl">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
                {assessment.title}
              </h2>
            </CardHeader>
            <CardContent className="p-5 bg-white text-black">
              <p className="text-sm text-gray-700">{assessment.description}</p>
              <p className="text-xs text-gray-500 mt-2">Click to view the scoreboard</p>
            </CardContent>
          </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Back Button */}
          <Button variant="outline" className="mb-4" onClick={() => setSelectedAssessment(null)}>
            ⬅ Back to Assessments
          </Button>

          {/* Students List for Selected Assessment */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => (
              <Card
                key={student.userId}
                className="cursor-pointer hover:shadow-lg transition"
                onClick={() => navigate(`/assessment/evaluate/${student.userId}/${selectedAssessment}`)}
              >
                <CardHeader className="flex items-center space-x-4">
                  <img
                    src={student.profile || "/default-avatar.png"}
                    alt="Profile"
                    className="w-12 h-12 rounded-full border"
                  />
                  <div>
                    <h2 className="text-lg font-semibold">{student.name}</h2>
                    <p className="text-sm text-gray-600">{student.email}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Total MCQ Score: {student.totalMarks} / {student.maxMarks}
                  </p>
                  <p className="text-xs text-gray-500">Click to evaluate paragraph answers</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Evaluate;
