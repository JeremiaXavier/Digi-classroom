import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "@/lib/axios";
import { Download, Eye, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-slice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "zustand";
import { classroomStore } from "@/store/classroomStore";

const getFileIcon = (filename) => {
  const ext = filename.split(".").pop().toLowerCase();

  let iconSrc;

  switch (ext) {
    case "pdf":
      iconSrc = "/public/pdf-101.svg"; // Path to your PDF icon from public folder
      break;
    case "doc":
    case "docx":
      iconSrc = "/public/word-98.svg"; // Path to your Word icon
      break;
    case "xls":
    case "xlsx":
      iconSrc = "/public/excel-85.svg"; // Path to your Excel icon
      break;
    case "ppt":
    case "pptx":
      iconSrc = "/public/powerpoint-33.svg"; // Path to your PowerPoint icon
      break;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      iconSrc = "/public/image-68.svg"; // Path to your Image icon
      break;
    default:
      iconSrc = "/public/image-68.svg"; // Path to a default icon
  }

  return <img src={iconSrc} alt={`${ext} icon`} className="w-8 h-8" />;
};

const StudentClassroomDetails = () => {
  const { id } = useParams();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
 const [assignments, setAssignments] = useState([]);
 const [members, setMembers] = useState([]);
  const [view, setView] = useState("materials");

  const { idToken } = useAuthStore();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchClassroomDetails = async () => {
      try {
        setLoading(true);

        const results = await Promise.allSettled([
          axiosInstance.get(`/c/${id}`, {
            headers: { Authorization: `Bearer ${idToken}` },
          }),
          axiosInstance.get(`/work/c/${id}`, {
            headers: { Authorization: `Bearer ${idToken}` },
          }),
          axiosInstance.get(`/c/${id}/members`, {
            headers: { Authorization: `Bearer ${idToken}` },
          }),
        ]);

        // Extract results safely
        const materialRes =
          results[0].status === "fulfilled" ? results[0].value : null;
        const assignmentsRes =
          results[1].status === "fulfilled" ? results[1].value : null;
        const memberRes =
          results[2].status === "fulfilled" ? results[2].value : null;

        // Set state only if data is available
        if (assignmentsRes)
          setAssignments(assignmentsRes.data.assignments);
        if (memberRes) setMembers(memberRes.data.allMembers);
        if (materialRes) setMaterials(materialRes.data.materials);

        console.log(
          "Fetched assignments:",
          assignmentsRes?.data?.assignments || "Failed"
        );
        console.log(
          "Fetched members:",
          memberRes?.data?.allMembers || "Failed"
        );
        console.log(
          "Fetched materials:",
          materialRes?.data?.materials || "Failed"
        );
      } catch (error) {
        console.error("Unexpected error fetching classroom details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClassroomDetails();
  }, [id, idToken]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState("");

  const openPreview = (fileUrl, fileExtension) => {
    if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(fileExtension)) {
      setPreviewType("image");
    } else if (["mp4", "webm", "ogg"].includes(fileExtension)) {
      setPreviewType("video");
    } else if (fileExtension === "pdf") {
      setPreviewType("pdf");
    } else if (["doc", "docx", "xls", "xlsx"].includes(fileExtension)) {
      setPreviewType("document");
    } else {
      alert("Preview not available for this file type.");
      return;
    }
    setPreviewUrl(fileUrl);
  };
  return (
    <div className="px-6 bg-white h-[95%] space-y-6 overflow-auto">
      {/* Navigation Tabs - Responsive */}
      <div className="flex w-full h-10 justify-around items-center  md:h-12">
        {["materials", "assignments", "members"].map((tab) => (
          <div
            key={tab}
            className={`flex-1 text-center py-2 cursor-pointer transition ${
              view === tab
                ? "border-b-2 border-blue-500 font-semibold"
                : "text-gray-500"
            }`}
            onClick={() => setView(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </div>
        ))}
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-2 m-2 sm:m-4 flex flex-col bg-white overflow-scroll">
        {/* Materials Section */}
        {view === "materials" &&
          (loading ? (
            <div className="flex items-center justify-center h-screen">
              <Loader className="size-10 animate-spin" />
            </div>
          ) : materials.length === 0 ? (
            <p className="text-gray-500 text-center">
              No materials uploaded yet.
            </p>
          ) : (
            <div className="flex flex-1 w-full flex-col gap-3">
              <div className="grid gap-4 grid-cols-1 w-full">
                {materials.map((material) => (
                  <Card
                    key={material._id}
                    className="shadow-md border rounded-lg cursor-pointer hover:shadow-lg transition p-4 w-full"
                  >
                    <CardHeader className="flex justify-center items-center md:items-start">
                      <CardTitle className="truncate">
                        {material.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{material.description}</p>

                      {/* Attachments */}
                      {material.fileUrls?.length > 0 && (
                        <div className="mt-3">
                          <h4 className="font-semibold text-gray-700">
                            Attachments:
                          </h4>
                          <div className="flex flex-col gap-2">
                            {material.fileUrls.map((fileUrl, index) => {
                              const filename = fileUrl.split("/").pop();
                              const fileExtension = filename
                                .split(".")
                                .pop()
                                .toLowerCase();
                              const isPreviewable = [
                                "jpg",
                                "jpeg",
                                "png",
                                "gif",
                                "mp4",
                                "pdf",
                              ].includes(fileExtension);

                              return (
                                <div
                                  key={index}
                                  className="flex items-center gap-3 border p-2 rounded-lg hover:bg-gray-50 transition"
                                >
                                  {getFileIcon(fileExtension)}
                                  <span className="flex-1 truncate">
                                    {filename}
                                  </span>

                                  {/* Preview Button */}
                                  {isPreviewable && (
                                    <Button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openPreview(fileUrl, fileExtension);
                                      }}
                                      variant="outline"
                                      size="icon"
                                      className="text-green-600 hover:bg-green-100"
                                    >
                                      <Eye />
                                    </Button>
                                  )}

                                  {/* Download Button */}
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownload(fileUrl, filename);
                                    }}
                                    variant="outline"
                                    size="icon"
                                    className="text-blue-600 hover:bg-blue-100"
                                  >
                                    <Download />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Uploaded By */}
                      <p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
                        {material.uploadedBy?.photoURL ? (
                          <img
                            src={material.uploadedBy.photoURL}
                            alt="User Avatar"
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                        )}
                        {material.uploadedBy?.fullName || "Unknown"}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}

        {/* Assignments Section */}
        {view === "assignments" &&
          (loading ? (
            <div className="flex items-center justify-center h-screen">
              <Loader className="size-10 animate-spin" />
            </div>
          ) : assignments.length === 0 ? (
            <p className="text-gray-500 text-center">
              No assignments uploaded yet.
            </p>
          ) : (
            <div className="flex flex-1 w-full flex-col gap-3">
              <div className="grid gap-4 grid-cols-1 w-full">
              
                {assignments.map((assignment) => (
                  <Card
                    key={assignment._id}
                    className="shadow-md border rounded-lg cursor-pointer hover:shadow-lg transition p-4 w-full"
                    onClick={() =>
                      navigate(`/student/dashboard/a/${assignment._id}`)
                    }
                  >
                    <CardHeader className="flex justify-between items-center md:items-start">
                      <CardTitle className="truncate">
                        {assignment.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{assignment.description}</p>

                      {/* Attachments */}
                      {assignment.attachments?.length > 0 && (
                        <div className="mt-3">
                          <h4 className="font-semibold text-gray-700">
                            Attachments:
                          </h4>
                          <div className="flex flex-col gap-2">
                            {assignment.attachments.map((fileUrl, index) => {
                              const filename = fileUrl.split("/").pop();
                              const fileExtension = filename
                                .split(".")
                                .pop()
                                .toLowerCase();
                              const isPreviewable = [
                                "jpg",
                                "jpeg",
                                "png",
                                "gif",
                                "mp4",
                                "pdf",
                              ].includes(fileExtension);

                              return (
                                <div
                                  key={index}
                                  className="flex items-center gap-3 border p-2 rounded-lg hover:bg-gray-50 transition"
                                >
                                  {getFileIcon(fileExtension)}
                                  <span className="flex-1 truncate">
                                    {filename}
                                  </span>

                                  {/* Preview Button */}
                                  {isPreviewable && (
                                    <Button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openPreview(fileUrl, fileExtension);
                                      }}
                                      variant="outline"
                                      size="icon"
                                      className="text-green-600 hover:bg-green-100"
                                    >
                                      <Eye />
                                    </Button>
                                  )}

                                  {/* Download Button */}
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownload(fileUrl, filename);
                                    }}
                                    variant="outline"
                                    size="icon"
                                    className="text-blue-600 hover:bg-blue-100"
                                  >
                                    <Download />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Uploaded By */}
                      <p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
                        {assignment.createdBy?.photoURL ? (
                          <img
                            src={assignment.createdBy.photoURL}
                            alt="User Avatar"
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                        )}
                        {assignment.createdBy?.fullName || "Unknown"}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}

        {/* Members Section */}
        {view === "members" &&
          (loading ? (
            <div className="flex items-center justify-center h-screen">
              <Loader className="size-10 animate-spin" />
            </div>
          ) : members.length === 0 ? (
            <p className="text-gray-500 text-center">No members.</p>
          ) : (
            <div className="flex gap-2 flex-col">
              {members.map((member) => (
                <Card key={member._id} className="shadow-md border rounded-lg">
                  <CardContent className="flex flex-row items-center gap-2 p-4">
                    <img
                      src={member.photoURL || "/default-avatar.png"}
                      alt="User Avatar"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <p className="text-lg text-gray-500">
                      {member.fullName || "Unknown"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
};

export default StudentClassroomDetails;