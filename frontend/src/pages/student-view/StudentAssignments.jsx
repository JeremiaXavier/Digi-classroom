import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Upload,
  FileText,
  CheckCircle,
  Clock,
  XIcon,
  File,
} from "lucide-react";
import { useStore } from "zustand";
import { classroomStore } from "@/store/classroomStore";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/store/auth-slice";
import toast from "react-hot-toast";

const AssignmentDetails = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState({});
  const { idToken } = useAuthStore();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [comment, setComment] = useState("");
  const [submission, setSubmission] = useState(null);
  const [grade, setGrade] = useState(null);
  const [feedback, setFeedback] = useState("");
  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const response = await axiosInstance.get(
          `/work/${assignmentId}/isSubmitted`,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );
        if (response.data) {
          setSubmission(response.data);
          setIsSubmitted(true);
          setUploadedFiles(response.data.files || []);
          if (response.data.grade) setGrade(response.data.grade);
          if (response.data.feedback) setFeedback(response.data.feedback);
        }
      } catch (error) {
        console.error("Error fetching submission:", error);
      }
    };
    fetchSubmission();
  }, [assignmentId, idToken,isSubmitted]);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const res = await axiosInstance.get(`/work/${assignmentId}`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        if (res.data) {
          setAssignment(res.data);
        }
      } catch (error) {
        console.error("Error fetching submission:", error);
      }
    };
    fetchAssignment();
  }, [assignmentId, idToken]);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0) {
      alert("Please upload at least one file before submitting.");
      return;
    }

    const formData = new FormData();
    uploadedFiles.forEach((file) => {
      formData.append("files", file);
      
    });

    setIsSubmitted(false);

    try {
      const response = await axiosInstance.post(
        `/work/${assignmentId}/submit`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      if (response.data.success) {
        setIsSubmitted(true);
        setUploadedFiles([]);
        
        toast.success("Submission is successfull");
      } else {
        toast.error(response.data.message || "Submission failed.");
      }
    } catch (error) {
      console.error("Error submitting assignment:", error);
      toast.error(
        error.response?.data?.message || "Failed to submit the assignment."
      );
    }
  };

  if (!assignment) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-gray-500">Assignment not found.</p>
      </div>
    );
  }

  return (
    <div className="w-full  flex items-center justify-center bg-white px-2 sm:px-2 overflow-auto mt-6">
      <Card className="w-full max-w-4xl  border-none rounded-2xl bg-white overflow-hidden relative flex flex-col ">
        {/* Close Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 right-4 flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
        >
          <XIcon className="w-6 h-6" />
        </button>

        {/* Content */}
        <CardContent className="p-4 sm:p-8 flex flex-col overflow-auto">
          {/* Assignment Details */}
          <div className="flex-grow">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              {assignment.title}
            </h1>
            <p className="text-gray-600 mt-2">{assignment.description}</p>
            <div className="flex items-center text-sm text-gray-500 mt-3">
              <Clock className="w-5 h-5 mr-2 text-red-500" />
              Due: {new Date(assignment.dueDate).toLocaleDateString()}
            </div>

            {/* Provided Materials */}
            {assignment.attachments?.length > 0 && (
              <div className="mt-4 sm:mt-5">
                <h2 className="font-semibold text-gray-700">Materials:</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-2">
                  {assignment.attachments.map((material, index) => (
                    <Card
                      key={index}
                      className="p-3 sm:p-4 border shadow-sm flex items-center gap-3"
                    >
                      {material.toLowerCase().endsWith(".pdf") ? (
                        <File className="w-6 sm:w-8 h-6 sm:h-8 text-red-500" />
                      ) : (
                        <FileText className="w-5 sm:w-6 h-5 sm:h-6 text-blue-500" />
                      )}
                      <a
                        href={material}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate"
                      >
                        {material.split("/").pop()}
                      </a>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Upload & Comment Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6">
            {/* Upload Assignment Section */}
            <div className="bg-white p-4 sm:p-5 rounded-lg border flex flex-col">
              <label className="block text-gray-700 font-medium">
                Upload :
              </label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="file"
                  multiple
                  className="hidden"
                  id="file-upload"
                  onChange={handleFileUpload}
                />
                {!isSubmitted &&  (
                  <label
                    htmlFor="file-upload"
                    className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer flex items-center gap-2 hover:bg-blue-600 text-sm sm:text-base"
                  >
                    <Upload className="w-4 sm:w-5 h-4 sm:h-5" />
                    Upload Files
                  </label>
                )}
              </div>

              {/* Show uploaded files */}
              {uploadedFiles.length > 0 && (
                <ul className="mt-3 space-y-2 flex-grow overflow-auto max-h-28 sm:max-h-32">
                  {uploadedFiles.map((file, index) => (
                    <li
                      key={index}
                      className="text-gray-600 flex items-center gap-2"
                    >
                      {file.type === "application/pdf" ? (
                        <File className="w-5 sm:w-6 h-5 sm:h-6 text-red-500" />
                      ) : (
                        <FileText className="w-4 sm:w-5 h-4 sm:h-5 text-gray-500" />
                      )}
                      {file.name || file.split("/").pop()}
                    </li>
                  ))}
                </ul>
              )}

              {!isSubmitted && (
                
                <Button
                  className={`mt-4 w-full text-sm sm:text-lg py-2 ${uploadedFiles.length===0 ? " bg-white":" bg-green-500"}`}
                  onClick={uploadedFiles.length!=0? handleSubmit: null}
                > {uploadedFiles.length ===0 ? null: "Hand In"}
                  
                </Button>
              )}

              {isSubmitted && (
                <div className="mt-4 bg-green-100 p-3 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 sm:w-6 h-5 sm:h-6 text-green-600 mr-2" />
                  
                  {grade ? <span className="text-green-700 font-semibold text-sm sm:text-base">
                    Teacher Checked!
                  </span> : <span className="text-green-700 font-semibold text-sm sm:text-base">
                    Submitted Successfully!
                  </span>}
                </div>
              )}
            </div>

            {/* Comment Section (NO TEXTAREA) */}
            {/* <div className="bg-white p-4 sm:p-5 rounded-lg border-none flex flex-col">
              <label className="block text-gray-700 font-medium">
                Leave a Comment:
              </label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="text"
                  className="w-full p-3 border rounded-lg text-gray-700 text-sm sm:text-base"
                  placeholder="Ask a question or leave a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
               
              </div>
            </div> */}
            {isSubmitted && (grade || feedback) && (
              <div className="bg-white p-4 sm:p-5 rounded-lg border mt-6 ">
                
                <div className="mt-2">
                  {grade && (
                    <p className="text-gray-700">
                      <strong>Grade:</strong>{" "}
                      <span className="text-green-600">{grade}</span>
                    </p>
                  )}
                  {feedback && (
                    <p className="text-gray-700 mt-1">
                      <strong>Teacher Feedback:</strong> {feedback}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentDetails;