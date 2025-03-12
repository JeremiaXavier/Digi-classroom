import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/auth-slice";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

const TeacherAssessmentsPage = () => {
  const navigate = useNavigate();
  const { idToken } = useAuthStore();
  const [assessments, setAssessments] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [selectedClassrooms, setSelectedClassrooms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

    const fetchClassrooms = async () => {
      try {
        const response = await axiosInstance.get("/c/all", {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        setClassrooms(response.data);
      } catch (error) {
        toast.error("Failed to fetch classrooms.");
      }
    };

    fetchAssessments();
    fetchClassrooms();
  }, [idToken]);

  const openModal = (assessmentId) => {
    setSelectedAssessment(assessmentId);
    setSelectedClassrooms([]);
    setIsModalOpen(true);
  };
  const handleDeleteAssessment = async (assessmentId) => {
    if (!window.confirm("Are you sure you want to delete this assessment?")) return;
  
    try {
      await axiosInstance.delete(`/assess/delete/${assessmentId}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
  
      setAssessments((prev) => prev.filter((assessment) => assessment._id !== assessmentId));
      toast.success("Assessment deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete assessment.");
    }
  };
  

  const toggleClassroomSelection = (classroomId) => {
    setSelectedClassrooms((prev) =>
      prev.includes(classroomId)
        ? prev.filter((id) => id !== classroomId)
        : [...prev, classroomId]
    );
  };

  const assignAssessment = async () => {
    if (!selectedAssessment || selectedClassrooms.length === 0) {
      toast.error("Please select at least one classroom.");
      return;
    }

    try {
      await axiosInstance.post(
        "/assess/assign",
        {
          assessmentId: selectedAssessment,
          classroomIds: selectedClassrooms,
        },
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      toast.success("Assessment assigned successfully!");
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to assign assessment.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📋 Your Assessments</h1>

      {assessments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((assessment) => (
            <div
              key={assessment._id}
              className="bg-white shadow-md hover:shadow-lg transition p-6 rounded-lg border"
            >
              <h2 className="text-lg font-semibold text-gray-800">
                {assessment.title}
              </h2>
              <p className="text-gray-600 mt-1 text-sm">{assessment.description}</p>
              <div className="mt-4 flex gap-3">
                
                <Button onClick={() => openModal(assessment._id)}>
                  Assign to Classroom
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDeleteAssessment(assessment._id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center">No assessments found.</p>
      )}

      {/* Assign Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Assessment</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-sm text-gray-600">Select classrooms:</p>
            <div className="grid grid-cols-2 gap-3">
              {classrooms.map((classroom) => (
                <div key={classroom._id} className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedClassrooms.includes(classroom._id)}
                    onCheckedChange={() => toggleClassroomSelection(classroom._id)}
                  />
                  <span className="text-sm text-gray-700">{classroom.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={assignAssessment}>Assign</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherAssessmentsPage;
