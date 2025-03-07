import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { axiosInstance } from "@/lib/axios";
import {
  Copy,
  Download,
  Eye,
  Loader,
  LucideTrash2,
  Mail,
  PlusCircle,
  Share2,
  Trash,
  Users,
} from "lucide-react";

import {
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
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/auth-slice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const TeacherClassroomDetails = () => {
  const { id } = useParams();
  const classrooms = classroomStore((state) => state.classrooms); // Get all classrooms from the store

  // Find the selected classroom
  const classroom = classrooms.find((c) => c._id === id);

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [members, setMembers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [newTeacher, setNewTeacher] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState(null);
  const [createDialogType, setCreateDialogType] = useState(null);
  const [view, setView] = useState("materials");
  const [createAssignment, setCreateAssignment] = useState({
    title: "",
    description: "",
    dueDate: "",
    acceptResponses: false,
    classroomId: "",
  });
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [showNewSubjectInput, setShowNewSubjectInput] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const { idToken } = useAuthStore();
  const handleCreateOption = (type) => {
    setCreateDialogType(type);
  };

  const closeCreateDialog = () => {
    setCreateDialogType(null);
  };
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
      if (assignmentsRes) setAssignments(assignmentsRes.data.assignments);
      if (memberRes) setMembers(memberRes.data.allMembers);
      if (materialRes) setMaterials(materialRes.data.materials);

      console.log(
        "Fetched assignments:",
        assignmentsRes?.data?.assignments || "Failed"
      );
      console.log("Fetched members:", memberRes?.data?.allMembers || "Failed");
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

  useEffect(() => {
    fetchClassroomDetails();
  }, [id, idToken]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const subjectsRes = await axiosInstance.get(`/c/${id}/get-subjects`, {
          // Fetch subjects
          headers: { Authorization: `Bearer ${idToken}` },
        });
        setSubjects(subjectsRes?.data.subjects); // Set subjects state
        console.log(
          "Fetched subjects:",
          subjectsRes?.data?.subjects || "Failed"
        );
      } catch (error) {
        console.error(error.message);
      }
    };
    fetchSubjects();
  }, [id]);

  /*   const handleChange = (e) => {
    const { name, value } = e.target;
    setCreateAssignment((prev) => ({ ...prev, name: value }));
  };

  const handleCheckboxChange = () => {
    setCreateAssignment((prev) => ({
      ...prev,
      acceptResponses: !prev.acceptResponses,
    }));
  }; */

  const handleAddTeacher = async () => {
    try {
      if (!newTeacher) {
        toast.error("enter the email of teacher!");
        return;
      }

      const response = await axiosInstance.post(
        `/c/${id}/add-teacher`,
        {
          name: newTeacher,
        },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      setTeachers([...teachers, response.data]);
      setNewTeacher("");
    } catch (error) {
      console.error("Error adding teacher:", error);
    }
  };

  const handleAddAssignment = async () => {
    try {
      const formData = new FormData();
      formData.append("title", createAssignment.title);
      formData.append("description", createAssignment.description);
      formData.append("dueDate", createAssignment.dueDate);
      formData.append("acceptResponses", createAssignment.acceptResponses);
      formData.append("classroomId", id);

      // Append multiple files
      if (createAssignment.files) {
        Array.from(createAssignment.files).forEach((file) => {
          formData.append("files", file);
        });
      }

      await axiosInstance.post(`/work/create`, formData, {
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Successfully created the assignment");

      setCreateAssignment({
        title: "",
        description: "",
        dueDate: "",
        acceptResponses: false,
        files: null,
      });
      fetchClassroomDetails();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create assignment"
      );

      setCreateAssignment({
        title: "",
        description: "",
        dueDate: "",
        acceptResponses: false,
        files: null,
      });
    }
  };

  const handleUploadMaterial = async () => {
    /* if (!title || !description || !files || files.length === 0) {
      alert("Please provide title, description, and select at least one file");
      return;
    }

    console.log("Uploading:", title, description);

    const formData = new FormData();
    Array.from(files).forEach((file, index) => {
      formData.append(`files`, file); // Use `files[]` to send multiple files properly
    });

    formData.append("title", title);
    formData.append("description", description);
    formData.append("subjectId", selectedSubject.trim()); // Trim any spaces

    try {
      const response = await axiosInstance.post(`/c/${id}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (response.status >= 200 && response.status < 300) {
        // Handle all success cases (200-299)
        toast.success("Materials uploaded successfully!");
      }
    } catch (error) {
      console.error(
        "Error uploading materials:",
        error.response?.data || error.message
      );
      alert("Failed to upload materials");
    } */
    if (!title.trim() || !description.trim() || !files.length) {
      toast.error(
        "Please provide title, description, and select at least one file"
      );
      return;
    }

    console.log("Uploading:", title, description);

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("subjectId", selectedSubject.trim());

    try {
      setLoading(true);
      const response = await axiosInstance.post(`/c/${id}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (response.status >= 200 && response.status < 300) {
        toast.success("Materials uploaded successfully!");
        setTitle("");
        setDescription("");
        setFiles([]);
        fetchClassroomDetails();
      }
    } catch (error) {
      console.error(
        "Error uploading materials:",
        error.response?.data || error.message
      );
      toast.error("Failed to upload materials");
    } finally {
      setLoading(false);
    }
  };
  const handleAddSubject = async () => {
    if (!newSubject.trim()) return;

    try {
      setLoading(true);
      const res = await axiosInstance.post(
        "/c/add-subjects",
        { name: newSubject, classroomId: id }, // Include classroomId
        { headers: { Authorization: `Bearer ${idToken}` } }
      );

      setSubjects((prevSubjects) => [...prevSubjects, res.data.subject]);
      setSelectedSubject(res.data.subject._id); // Auto-select new subject
      setShowNewSubjectInput(false); // Hide input field
      setNewSubject(""); // Reset input
    } catch (error) {
      console.error("Failed to add subject", error);
    } finally {
      setLoading(false);
    }
  };
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

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) {
      return;
    }

    try {
      const response = await axiosInstance.delete(
        `/work/${assignmentId}/delete`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      if (response.status === 200) {
        // Update state to remove deleted assignment
        setAssignments((prevAssignments) =>
          prevAssignments.filter(
            (assignment) => assignment._id !== assignmentId
          )
        );
      }
    } catch (error) {
      console.error("Error deleting assignment:", error);
      alert("Error deleting assignment. Please try again.");
    }
  };
  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm("Are you sure you want to delete this material?")) {
      return;
    }

    try {
      if (!idToken) {
        alert("Authorization token is missing. Please log in again.");
        return;
      }

      const response = await axiosInstance.delete(`/c/m/${materialId}/delete`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (response.status === 200 || response.status === 204) {
        // Update state to remove deleted material
        setMaterials((prevMaterials) =>
          prevMaterials.filter((material) => material._id !== materialId)
        );
      } else {
        alert("Failed to delete material. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting material:", error.response || error);
      alert(
        error.response?.data?.message ||
          "Error deleting material. Please try again."
      );
    }
  };

  return (
    <div className="p-1 bg-white h-[95%] space-y-6 overflow-scroll">
      <div className="flex gap-4">
        

        {/* add assignment */}

        {/* <button
          className="px-4 py-2 fixed right-2 top-2/4  bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
          onClick={() => {
            setCreateDialogType("material");
          }}
        >
          <PlusCircle className="w-5 h-5" />
          <span>Upload</span>
        </button> */}
        {createDialogType === "Assignment" && (
          <Sheet open={true} onOpenChange={closeCreateDialog}>
            <SheetContent side="right" className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Create New Assignment</SheetTitle>
                <SheetDescription>
                  Fill in the details below to create a new assignment.
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4">
                {/* Assignment Title */}
                <Input
                  name="title"
                  placeholder="Assignment Title"
                  value={createAssignment.title}
                  onChange={(e) =>
                    setCreateAssignment((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                />

                {/* Description */}
                <Textarea
                  name="description"
                  className="w-full p-2 border rounded"
                  placeholder="Instructions"
                  rows={4}
                  value={createAssignment.description}
                  onChange={(e) =>
                    setCreateAssignment((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />

                {/* Due Date */}
                <Input
                  type="date"
                  name="dueDate"
                  value={createAssignment.dueDate}
                  onChange={(e) =>
                    setCreateAssignment((prev) => ({
                      ...prev,
                      dueDate: e.target.value,
                    }))
                  }
                />

                {/* File Upload */}
                <div className="border p-2 rounded">
                  <label className="block mb-1 text-sm font-medium">
                    Attachments
                  </label>
                  <Input
                    type="file"
                    multiple
                    onChange={(e) =>
                      setCreateAssignment((prev) => ({
                        ...prev,
                        files: e.target.files,
                      }))
                    }
                  />
                </div>

                {/* Accept Responses Checkbox */}
                <Checkbox
                  checked={createAssignment.acceptResponses}
                  onCheckedChange={(checked) =>
                    setCreateAssignment((prev) => ({
                      ...prev,
                      acceptResponses: checked,
                    }))
                  }
                  label="Accept Responses"
                />
              </div>

              {/* Submit Button */}
              <SheetFooter>
                <SheetClose asChild>
                  <button
                    type="button"
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    onClick={handleAddAssignment}
                  >
                    Create Assignment
                  </button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        )}

        {createDialogType === "material" && (
          <Sheet open={true} onOpenChange={closeCreateDialog}>
            <SheetContent side="right" className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Upload New Material</SheetTitle>
                <SheetDescription>
                  Fill in the details below to upload new material.
                </SheetDescription>
              </SheetHeader>

              <div className="p-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <Input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter title"
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm sm:text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter description"
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm sm:text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                {/* Subject Dropdown with Add New Option */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  <Select
                    value={selectedSubject}
                    onValueChange={(value) => {
                      if (value === "add-new") {
                        setShowNewSubjectInput(true);
                      } else {
                        setSelectedSubject(value);
                      }
                    }}
                  >
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue placeholder="Select or search a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject._id} value={subject._id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="add-new" className="text-blue-500">
                        ➕ Add New Subject
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Show input field if user chooses "Add New Subject" */}
                {showNewSubjectInput && (
                  <div className="mb-4 flex gap-2">
                    <Input
                      type="text"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      placeholder="Enter new subject name"
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleAddSubject}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Add
                    </button>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Files
                  </label>
                  <Input
                    type="file"
                    onChange={(e) => setFiles(e.target.files)}
                    multiple
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm sm:text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleUploadMaterial}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Upload
                </button>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
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
              <div className="flex justify-end">
                <button
                  className="px-4 py-2 bg-blue-500 right-2  text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
                  onClick={() => {
                    setCreateDialogType("material");
                  }}
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Create New</span>
                </button>
              </div>
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
                    <button
                      onClick={() => handleDeleteMaterial(material._id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      <LucideTrash2 size={20} />
                    </button>
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
              <div className="flex justify-end">
                <button
                  className="px-4 py-2 bg-blue-500 right-2  text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
                  onClick={() => {
                    setCreateDialogType("Assignment");
                  }}
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Assignment</span>
                </button>
              </div>
              <p className="text-gray-500">No assignments uploaded yet.</p>
            </div>
          ) : (
            <div className="flex flex-1 w-full flex-col gap-3">
              <div className="flex justify-end">
                <button
                  className="px-4 py-2 bg-blue-500 right-2  text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
                  onClick={() => {
                    setCreateDialogType("Assignment");
                  }}
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Assignment</span>
                </button>
              </div>

              {assignments.map((assignment) => (
                <Card
                  key={assignment._id}
                  className="shadow-md border rounded-lg"
                >
                  <CardHeader className="flex flex-row gap-3 justify-between  items-center">
                    <CardTitle>{assignment.title}</CardTitle>
                    <button
                      onClick={() => handleDeleteAssignment(assignment._id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      <LucideTrash2 size={20} />
                    </button>
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
                                href={file} // Ensure this is the correct file URL
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                              >
                                {file.split("/").pop()} {/* Show file name */}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
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
              <div className="flex justify-end">
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="px-4 py-2 bg-gray-50 text-dark  hover:bg-yellow-200  border rounded-lg">
                      Class Code :<b> {classroom.joinCode}</b>
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogTitle>Classroom Join Code</DialogTitle>
                    <DialogDescription>
                      Share this code with students to allow them to join the
                      classroom.
                    </DialogDescription>

                    {/* Join Code Display & Copy Button */}
                    <div className="flex justify-between items-center border p-3 rounded-md">
                      <span className="font-semibold text-lg">
                        {classroom.joinCode}
                      </span>
                      <button
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
                        onClick={() =>
                          navigator.clipboard.writeText(classroom.joinCode)
                        }
                      >
                        <Copy size={16} />
                        Copy
                      </button>
                    </div>

                    {/* Share Options */}
                    <div className="flex justify-between items-center gap-2 mt-3">
                      {/* Email */}
                      <a
                        href={`mailto:?subject=Join Classroom&body=Use this code to join: ${classroom.joinCode}`}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                      >
                        <Mail size={16} />
                        Email
                      </a>

                      {/* WhatsApp */}
                      <a
                        href={`https://wa.me/?text=Join the classroom using this code: ${classroom.joinCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-6 h-6 text-green-950"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2C6.477 2 2 6.477 2 12c0 2.117.621 4.088 1.684 5.736L2 22l4.36-1.572A9.964 9.964 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm.912 14.789a5.918 5.918 0 01-3.186-1.04l-.228-.17-1.89.497.5-1.853-.178-.233a5.911 5.911 0 01-1.04-3.186c0-.198.01-.396.03-.593l.057-.557.404-.141a8.176 8.176 0 011.158-.283c.259-.043.52-.065.781-.065.198 0 .395.01.593.03l.557.057.14.404c.08.233.157.466.228.703.069.228.134.466.198.703l.085.304-.235.128a3.913 3.913 0 00-1.725 1.722l-.129.237.305.085c.233.064.466.129.703.198.233.071.466.148.703.228l.404.14.058.557c.02.198.03.396.03.593 0 .26-.022.521-.065.781a8.176 8.176 0 01-.283 1.158l-.141.404-.557.057c-.197.02-.395.03-.593.03z" />
                        </svg>
                        WhatsApp
                      </a>

                      {/* Share Button (for other platforms) */}
                      <button
                        className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: "Join Classroom",
                              text: `Join the classroom using this code: ${classroom.joinCode}`,
                              url: window.location.href,
                            });
                          } else {
                            alert("Sharing not supported on this browser.");
                          }
                        }}
                      >
                        <Share2 size={16} />
                        Share
                      </button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="px-4 py-2 bg-gray-50 text-dark rounded hover:bg-yellow-200 flex items-center gap-2">
                      <Users />
                      <span>Add Teacher</span>
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogTitle>Add Teacher</DialogTitle>
                    <DialogDescription>
                      Enter the teacher's email to add them to the classroom.
                    </DialogDescription>
                    <div className="space-y-4">
                      <Input
                        placeholder="Teacher's Email"
                        value={newTeacher}
                        type="email"
                        onChange={(e) => setNewTeacher(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <button
                          type="button"
                          onClick={handleAddTeacher}
                          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Add Teacher
                        </button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

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
        {/* Preview Modal */}
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

export default TeacherClassroomDetails;
