import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "@/lib/axios";
import { Download, Eye, Loader } from "lucide-react";
/* import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

import toast from "react-hot-toast";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"; */

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-slice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "zustand";
import { classroomStore } from "@/store/classroomStore";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

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
  /*   const [assignments, setAssignments] = useState([]);
   */ const [members, setMembers] = useState([]);
  const [view, setView] = useState("materials");
  const { set, assignments } = useStore(classroomStore);

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
          set({ assignments: assignmentsRes.data.assignments });
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
    <div className="p-1 bg-white h-[95%] space-y-6 overflow-scroll">
      <div className="flex w-full h-8 justify-around items-center">
        <div
          className="flex cursor-pointer"
          onClick={() => setView("materials")}
        >
          Materials
        </div>
        <div
          className="flex cursor-pointer"
          onClick={() => setView("assignments")}
        >
          Assignments
        </div>
        <div className="flex cursor-pointer" onClick={() => setView("members")}>
          Members
        </div>
      </div>

      <div className="p-6 m-6 bg-white overflow-scroll">
        {view === "materials" &&
          (loading ? (
            <div className="flex items-center justify-center h-screen">
              <Loader className="size-10 animate-spin" />
            </div>
          ) : materials.length === 0 ? (
            <div className="flex flex-1 w-full flex-col gap-3">
              <p className="text-gray-500">No Materials uploaded yet.</p>
            </div>
          ) : (
            <div className="flex flex-1 w-full flex-col gap-3">
              {materials.map((material) => (
                <Card
                  key={material._id}
                  className="shadow-md border rounded-lg"
                >
                  <CardHeader className="flex flex-row gap-3 justify-between items-center">
                    <CardTitle>{material.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{material.description}</p>
                    <div className="mt-2 space-y-3">
                      {material.fileUrls && material.fileUrls.length > 0 ? (
                        material.fileUrls.map((fileUrl, index) => {
                          if (!fileUrl) return null;

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
                            "bmp",
                            "webp",
                            "mp4",
                            "webm",
                            "ogg",
                            "pdf",
                            "doc",
                            "docx",
                          ].includes(fileExtension);

                          return (
                            <div
                              key={index}
                              className="flex items-center gap-3 border p-3 rounded-lg hover:bg-gray-50 transition"
                            >
                              {getFileIcon(fileExtension)}
                              <span className="flex-1 truncate text-gray-700">
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
                        })
                      ) : (
                        <p className="text-sm text-gray-500">
                          No files available
                        </p>
                      )}
                    </div>

                    <p className="text-sm text-gray-500 mt-3 flex flex-row items-center gap-3">
                      {material.uploadedBy?.photoURL ? (
                        <img
                          src={material.uploadedBy.photoURL}
                          alt="User Avatar"
                          className="w-8 h-8 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div></div>
                      )}
                      {material.uploadedBy?.fullName || "Unknown"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}
        {view === "assignments" &&
          (loading ? (
            <div className="flex items-center justify-center h-screen ">
              <Loader className="size-10 animate-spin" />
            </div>
          ) : assignments.length === 0 ? (
            <div className="flex flex-1 w-full flex-col gap-3">
              <p className="text-gray-500">No assignments uploaded yet.</p>
            </div>
          ) : (
            <div className="flex flex-1 w-full flex-col gap-3">
              {assignments.map((assignment) => (
                <Card
                  key={assignment._id}
                  className="shadow-md border rounded-lg cursor-pointer hover:shadow-lg transition"
                  onClick={() =>
                    navigate(`/student/dashboard/a/${assignment._id}`)
                  } // Use onClick instead of <Link>
                >
                  <div className="block p-4">
                    <CardHeader className="flex flex-row gap-3 justify-between items-center">
                      <CardTitle>{assignment.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{assignment.description}</p>

                      <p className="text-sm text-gray-500 mt-3 flex flex-row items-center gap-3">
                        {assignment.createdBy?.photoURL ? (
                          <img
                            src={assignment.createdBy.photoURL}
                            alt="User Avatar"
                            className="w-8 h-8 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div></div>
                        )}
                        {assignment.createdBy?.fullName || "Unknown"}
                      </p>

                      {/* Display Files */}
                      {assignment.attachments?.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-semibold">Attachments:</h4>
                          <ul className="list-disc list-inside text-blue-600">
                            {assignment.attachments.map((file, index) => (
                              <li key={index}>
                                <a
                                  href={file}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline"
                                >
                                  {file.split("/").pop()}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          ))}
        {view === "members" &&
          (loading ? (
            <div className="flex items-center justify-center h-screen">
              <Loader className="size-10 animate-spin" />
            </div>
          ) : members.length === 0 ? (
            <p className="text-gray-500">No members.</p>
          ) : (
            <div className="flex flex-1 w-full flex-col gap-3">
              {members.map((member) => (
                <Card key={member._id} className="shadow-md border rounded-lg">
                  <CardContent>
                    <p className="text-lg text-gray-500 mt-3 flex flex-row  items-center gap-3">
                      {member.photoURL ? (
                        <img
                          src={member.photoURL}
                          alt="User Avatar"
                          className="w-12 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div></div>
                      )}
                      {member.fullName || "Unknown"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}
          {previewUrl && (
          <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
            <DialogContent>
              <DialogTitle>Preview</DialogTitle>
              {previewType === "image" && (
                <img src={previewUrl} alt="Preview" className="w-full h-auto" />
              )}
              {previewType === "video" && (
                <video src={previewUrl} controls className="w-full h-auto" />
              )}
              {previewType === "pdf" && (
                <iframe src={previewUrl} className="w-full h-[500px]" />
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default StudentClassroomDetails;