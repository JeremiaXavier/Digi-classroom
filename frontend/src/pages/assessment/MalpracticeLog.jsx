import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/store/auth-slice";
import toast from "react-hot-toast";
import { Menu, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MalpracticeLog = () => {
  const [assessments, setAssessments] = useState([]);
  const [malpracticeLogs, setMalpracticeLogs] = useState([]);
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

  useEffect(() => {
    if (!selectedAssessment) return;

    const fetchMalpracticeLogs = async () => {
      try {
        const response = await axiosInstance.get(
          `/assess/malpractice/${selectedAssessment}`,
          {
            headers: { Authorization: `Bearer ${idToken}` },
          }
        );
        setMalpracticeLogs(response.data);
      } catch (error) {
        console.error("Error fetching malpractice logs:", error);
        setMalpracticeLogs({});
      }
    };

    const interval = setInterval(() => {
      fetchMalpracticeLogs();
    }, 3000); // Fetch every 3 seconds

    // Cleanup interval on component unmount or when assessment is changed
    return () => clearInterval(interval);
  }, [selectedAssessment, idToken]);

  const handleSuspendStudent = async (logId) => {
    try {
      // Call an API to suspend the student for this malpractice log
      await axiosInstance.post(`/assess/suspend/${logId}`, null, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      toast.success("Student suspended successfully.");
      // Re-fetch malpractice logs
     
    } catch (error) {
      toast.error("Failed to suspend student.");
    }
  };

  const handleRemoveSuspension = async (logId) => {
    try {
      // Call an API to remove the suspension for this malpractice log
      await axiosInstance.post(`/assess/remove-suspension/${logId}`, null, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      toast.success("Suspension removed successfully.");
      // Re-fetch malpractice logs
     
    } catch (error) {
      toast.error("Failed to remove suspension.");
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
              onClick={() =>   setSelectedAssessment(assessment._id)}
            >
              <CardHeader className="p-5 text-center bg-white rounded-t-xl">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
                  {assessment.title}
                </h2>
              </CardHeader>
              <CardContent className="p-5 bg-white text-black">
                <p className="text-sm text-gray-700">
                  {assessment.description}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Click to view malpractice logs
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Back Button */}
          <Button
            variant="outline"
            className="mb-4"
            onClick={() => setSelectedAssessment(null)}
          >
            ⬅ Back to Assessments
          </Button>

          {/* Malpractice Logs for Selected Assessment */}
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">Malpractice Logs</h2>
            <div className="space-y-4">
              {malpracticeLogs.length > 0 ? (
                malpracticeLogs.map((log) => (
                    <div key={log._id} className="p-4 bg-gray-100 rounded-lg shadow-md">
                    <div className="flex items-center justify-between"> {/* Flex container with space between */}
                      <div className="flex items-center">
                        <img
                          src={log.userId.photoURL || "/default-avatar.png"}
                          alt="Profile"
                          className="w-12 h-12 rounded-full border"
                          referrerPolicy="no-referer"
                        />
                        <div className="ml-4">
                          <p className="font-semibold">{log.userId.fullName}</p>
                          <p className="text-xs text-gray-500">{log.userId.email}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 text-gray-600 hover:text-black">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="mt-2 w-40 bg-white shadow-lg rounded-md"
                        >
                          <DropdownMenuItem onClick={() => handleSuspendStudent(log._id)}>
                            Suspend
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRemoveSuspension(log._id)}>
                            Remove Suspension
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="font-semibold mt-2">Violation: {log.violationType}</p>
                    <p>Action Taken: {log.actionTaken}</p>
                    <p className="text-sm text-gray-500">
                      Timestamp: {new Date(log.timestamp).toLocaleString()}
                    </p>
                    <p className="text-sm">{log.details}</p>
                    {log.isSuspended && (
                      <p className="text-lg bg-red-500 rounded-lg">
                        Student is suspended from examination
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p>No malpractice logs found for this assessment.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MalpracticeLog;
