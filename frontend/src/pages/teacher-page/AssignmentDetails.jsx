import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { File, FileText, Clock, XIcon } from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/store/auth-slice";
import toast from "react-hot-toast";
import { classroomStore } from "@/store/classroomStore";
import { useStore } from "zustand";

const AssignmentDetailsTeacher = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const { idToken } = useAuthStore();
  const { assignments } = useStore(classroomStore);
  const assignment = assignments.find((a) => a._id === assignmentId);

  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await axiosInstance.get(`/work/${assignmentId}/viewall`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        setSubmissions(response.data);
      } catch (error) {
        console.error("Error fetching submissions:", error);
      }
    };

    fetchSubmissions();
  }, [assignmentId, idToken]);

  if (!assignment) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-gray-500">Loading assignment details...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center bg-white py-10">
      <Card className="w-full max-w-4xl h-[80vh] shadow-xl border rounded-2xl bg-gray-50 overflow-hidden relative flex flex-col">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 right-4 flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
        >
          <XIcon className="w-6 h-6" />
        </button>

        <CardContent className="p-8 h-full flex flex-col">
          <div className="flex-col">
            <h1 className="text-3xl font-bold text-gray-800">{assignment.title}</h1>
            <p className="text-gray-600 mt-2">{assignment.description}</p>
            <div className="flex items-center text-sm text-gray-500 mt-3">
              <Clock className="w-5 h-5 mr-2 text-red-500" />
              Due: {new Date(assignment.dueDate).toLocaleDateString()}
            </div>

            {assignment.attachments?.length > 0 && (
              <div className="mt-5">
                <h2 className="font-semibold text-gray-700">Materials:</h2>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {assignment.attachments.map((material, index) => (
                    <Card key={index} className="p-4 border shadow-sm flex items-center gap-3">
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

          <div className="bg-gray-50 p-5 rounded-lg border mt-6 flex-grow">
            <h2 className="text-xl font-semibold text-gray-800">Student Submissions:</h2>

            {submissions.length === 0 ? (
              <p className="text-gray-500 mt-2">No submissions yet.</p>
            ) : (
              <div className="mt-4 space-y-4 h-full overflow-auto">
                {submissions.map((submission, index) => (
                  <Card key={index} className="p-4 border rounded-lg bg-white shadow flex items-start gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={submission.studentId.photoURL} alt={submission.studentId.fullName} />
                      <AvatarFallback>{submission.studentId.fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-gray-800 font-medium">
                        {submission.studentId.fullName} ({submission.studentId.email})
                      </h3>
                      {submission.files?.length > 0 && (
                        <div className="mt-2">
                          <h4 className="text-gray-700 font-medium">Submitted Files:</h4>
                          <ul className="space-y-2 mt-1">
                            {submission.files.map((file, fileIndex) => (
                              <li key={fileIndex} className="flex items-center gap-2">
                                {file.toLowerCase().endsWith(".pdf") ? (
                                  <File className="w-6 h-6 text-red-500" />   
                                ) : (
                                  <FileText className="w-5 h-5 text-gray-500" />
                                )}
                                <a
                                  href={file}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {file.split("/").pop()}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {submission.comment && (
                        <div className="mt-2 p-2 border-l-4 border-blue-500 bg-blue-50">
                          <p className="text-gray-700 italic">{submission.comment}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentDetailsTeacher;
