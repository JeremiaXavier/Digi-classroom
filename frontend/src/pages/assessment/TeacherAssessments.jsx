import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/auth-slice";

const TeacherAssessmentsPage = () => {
  const navigate = useNavigate();
  const { idToken } = useAuthStore();
  const [assessments, setAssessments] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [selectedClassrooms, setSelectedClassrooms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch assessments
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

    // Fetch classrooms
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

  // Open the modal and set the selected assessment
  const openModal = (assessmentId) => {
    setSelectedAssessment(assessmentId);
    setSelectedClassrooms([]);
    setIsModalOpen(true);
  };

  // Handle classroom selection
  const toggleClassroomSelection = (classroomId) => {
    setSelectedClassrooms((prev) =>
      prev.includes(classroomId)
        ? prev.filter((id) => id !== classroomId)
        : [...prev, classroomId]
    );
  };

  // Handle assessment assignment
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
      <h1 className="text-3xl font-bold mb-4">📋 All Created Assessments</h1>

      {assessments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((assessment) => (
            <div
              key={assessment._id}
              className="bg-white p-4 shadow-md rounded-lg"
            >
              <h2 className="text-xl font-semibold">{assessment.title}</h2>
              <p className="text-gray-600">{assessment.description}</p>
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={() => navigate(`/assessment/${assessment._id}`)}
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                  View
                </button>
                <button
                  onClick={() => openModal(assessment._id)}
                  className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                >
                  Assign to Classroom
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No assessments have been created yet.</p>
      )}

      {/* Assign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Assign Assessment</h2>
            <p className="mb-2">Select classrooms:</p>
            {classrooms.map((classroom) => (
              <div key={classroom._id} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  value={classroom._id}
                  onChange={() => toggleClassroomSelection(classroom._id)}
                  className="mr-2"
                />
                <label>{classroom.name}</label>
              </div>
            ))}

            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={assignAssessment}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAssessmentsPage;
