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
import { Textarea } from "@/components/ui/textarea";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/store/auth-slice";
import toast from "react-hot-toast";

const AssignmentDetails = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const { assignments } = useStore(classroomStore);
  const assignment = assignments.find((a) => a._id === assignmentId);
  const { idToken } = useAuthStore();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [comment, setComment] = useState("");
  const [submission, setSubmission] = useState(null);
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
        }
      } catch (error) {
        console.error("Error fetching submission:", error);
      }
    };
    fetchSubmission();
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
        `http://localhost:5001/api/work/${assignmentId}/submit`,
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
    <div className="w-full flex items-center justify-center bg-white">
      <Card className="w-full max-w-4xl h-[85vh] shadow-xl border rounded-2xl bg-gray-50 overflow-hidden relative flex flex-col">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 right-4 flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
        >
          <XIcon className="w-6 h-6" />
        </button>

        <CardContent className="p-8 h-full flex flex-col">
          <div className="flex-grow">
            <h1 className="text-3xl font-bold text-gray-800">
              {assignment.title}
            </h1>
            <p className="text-gray-600 mt-2">{assignment.description}</p>
            <div className="flex items-center text-sm text-gray-500 mt-3">
              <Clock className="w-5 h-5 mr-2 text-red-500" />
              Due: {new Date(assignment.dueDate).toLocaleDateString()}
            </div>

            {/* Provided Materials */}
            {assignment.attachments?.length > 0 && (
              <div className="mt-5">
                <h2 className="font-semibold text-gray-700">Materials:</h2>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {assignment.attachments.map((material, index) => (
                    <Card
                      key={index}
                      className="p-4 border shadow-sm flex items-center gap-3"
                    >
                      {material.toLowerCase().endsWith(".pdf") ? (
                        <File className="w-8 h-8 text-red-500" />
                      ) : (
                        <FileText className="w-5 h-5 text-blue-500" />
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
          <div className="grid grid-cols-2 gap-6 mt-auto">
            {/* Upload Assignment Section */}
            <div className="bg-gray-50 p-5 rounded-lg border flex flex-col">
              <label className="block text-gray-700 font-medium">
                Upload Assignment:
              </label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="file"
                  multiple
                  className="hidden"
                  id="file-upload"
                  onChange={handleFileUpload}
                />
                {!isSubmitted && (
                  <label
                    htmlFor="file-upload"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer flex items-center gap-2 hover:bg-blue-600"
                  >
                    <Upload className="w-5 h-5" />
                    Upload Files
                  </label>
                )}
              </div>

              {/* Show uploaded files */}
              {uploadedFiles.length > 0 && (
                <ul className="mt-3 space-y-2 flex-grow overflow-auto max-h-32">
                  {uploadedFiles.map((file, index) => (
                    <li
                      key={index}
                      className="text-gray-600 flex items-center gap-2"
                    >
                      {file.type === "application/pdf" ? (
                        <File className="w-6 h-6 text-red-500" />
                      ) : (
                        <FileText className="w-5 h-5 text-gray-500" />
                      )}
                      {file.name || file.split("/").pop()}

                    </li>
                  ))}
                </ul>
              )}

              {!isSubmitted && (
                <Button
                  className="mt-4 w-full bg-green-500 hover:bg-green-600 text-lg py-2"
                  onClick={handleSubmit}
                >
                  Hand In Assignment
                </Button>
              )}

              {isSubmitted && (
                <div className="mt-4 bg-green-100 p-3 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                  <span className="text-green-700 font-semibold">
                    Submitted Successfully!
                  </span>
                </div>
              )}
            </div>

            {/* Comment Section */}
            <div className="bg-gray-50 p-5 rounded-lg border flex flex-col">
              <label className="block text-gray-700 font-medium">
                Leave a Comment:
              </label>
              <Textarea
                className="mt-2 w-full p-3 border rounded-lg text-gray-700 flex-grow"
                rows="3"
                placeholder="Ask a question or leave a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <Button
                className="mt-3 w-full bg-gray-700 hover:bg-gray-800 text-white"
                disabled={!comment.trim()}
              >
                Submit Comment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentDetails;
