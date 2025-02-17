import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { axiosInstance } from "@/lib/axios";
import { Download, Loader, PlusCircle, Users } from "lucide-react";

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
  });
  const { idToken } = useAuthStore();
  const handleCreateOption = (type) => {
    setCreateDialogType(type);
  };

  const closeCreateDialog = () => {
    setCreateDialogType(null);
  };

  useEffect(() => {
    const fetchClassroomDetails = async () => {
      try {
        setLoading(true);
  
        const results = await Promise.allSettled([
          axiosInstance.get(`/c/${id}`, {
            headers: { Authorization: `Bearer ${idToken}` },
          }),
          axiosInstance.get(`/c/${id}/assignments`, {
            headers: { Authorization: `Bearer ${idToken}` },
          }),
          axiosInstance.get(`/c/${id}/members`, {
            headers: { Authorization: `Bearer ${idToken}` },
          }),
        ]);
  
        // Extract results safely
        const materialRes = results[0].status === "fulfilled" ? results[0].value : null;
        const assignmentsRes = results[1].status === "fulfilled" ? results[1].value : null;
        const memberRes = results[2].status === "fulfilled" ? results[2].value : null;
  
        // Set state only if data is available
        if (assignmentsRes) setAssignments(assignmentsRes.data.assignments);
        if (memberRes) setMembers(memberRes.data.allMembers);
        if (materialRes) setMaterials(materialRes.data.materials);
  
        console.log("Fetched assignments:", assignmentsRes?.data?.assignments || "Failed");
        console.log("Fetched members:", memberRes?.data?.allMembers || "Failed");
        console.log("Fetched materials:", materialRes?.data?.materials || "Failed");
  
      } catch (error) {
        console.error("Unexpected error fetching classroom details:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchClassroomDetails();
  }, [id, idToken]);
 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCreateAssignment((prev) => ({ ...prev, name: value }));
  };

  const handleCheckboxChange = () => {
    setCreateAssignment((prev) => ({
      ...prev,
      acceptResponses: !prev.acceptResponses,
    }));
  };

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
      await axiosInstance.post(`/c/${id}/add-assignment`, createAssignment, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      toast.success("succeefully created the assignment");
      setCreateAssignment({
        title: "",
        description: "",
        dueDate: "",
        acceptResponses: false,
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create assignment"
      );
      setCreateAssignment({
        title: "",
        description: "",
        dueDate: "",
        acceptResponses: false,
      });
    }
  };

  const handleUploadMaterial = async () => {
    if (!title || !description || !files || files.length === 0) {
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
    }
  };

  return (
    <div className="p-1 bg-white h-[95%] space-y-6 overflow-scroll">
      <div className="flex gap-4">
        <Dialog>
          <DialogTrigger asChild>
            <button className="p-4 right-2 fixed bg-green-500 text-white rounded hover:bg-green-600 flex items-center space-x-2">
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

        {/* add assignment */}
        <button
          className="px-4 py-2 bg-blue-500 right-2 top-3/4 fixed text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
          onClick={() => {
            setCreateDialogType("Assignment");
          }}
        >
          <PlusCircle className="w-5 h-5" />
          <span>Assignment</span>
        </button>
        <button
          className="px-4 py-2 fixed right-2 top-2/4  bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
          onClick={() => {
            setCreateDialogType("material");
          }}
        >
          <PlusCircle className="w-5 h-5" />
          <span>Upload</span>
        </button>
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
                <Input
                  type="date"
                  name="dueDate"
                  placeholder="Due Date"
                  value={createAssignment.dueDate}
                  onChange={(e) =>
                    setCreateAssignment((prev) => ({
                      ...prev,
                      dueDate: e.target.value,
                    }))
                  }
                />
                <Checkbox
                  checked={createAssignment.acceptResponses}
                  onCheckedChange={handleCheckboxChange}
                  label="Accept Responses"
                />
              </div>
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
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter description"
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm sm:text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Files
                  </label>
                  <Input
                    type="file"
                    onChange={(e) => setFiles(e.target.files)} // Handle multiple files
                    multiple
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm sm:text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleUploadMaterial}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 "
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
      

      <div className="p-6 m-6 bg-slate-100 overflow-scroll">
        {view === "materials" &&
          (loading ? (
            <div className="flex items-center justify-center h-screen">
              <Loader className="size-10 animate-spin" />
            </div>
          ) : materials.length === 0 ? (
            <p className="text-gray-500">No materials uploaded yet.</p>
          ) : (
            <div className="flex flex-1 w-full flex-col gap-3  ">
              {materials.map((material) => (
                <Card
                  key={material._id}
                  className="shadow-md border rounded-lg"
                >
                  <CardHeader className="flex flex-row gap-3 items-center">
                    <CardTitle>{material.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{material.description}</p>
                    <div className="mt-2 space-y-3">
                      {/* Check if fileUrls exists and is not empty */}
                      {material.fileUrls && material.fileUrls.length > 0 ? (
                        material.fileUrls.map((fileUrl, index) => {
                          // Ensure fileUrl is not null or undefined
                          if (!fileUrl) return null;

                          const filename = fileUrl.split("/").pop(); // Extract the file name from URL
                          const fileExtension = filename
                            .split(".")
                            .pop()
                            .toLowerCase(); // Get file extension for icon

                          return (
                            <div
                              key={index}
                              className="flex items-center gap-3 border p-3 rounded-lg hover:bg-gray-50 transition"
                            >
                              {getFileIcon(fileExtension)} {/* File icon */}
                              <span className="flex-1 truncate text-gray-700">
                                {filename}
                              </span>
                              <Button
                                onClick={() =>
                                  handleDownload(fileUrl, filename)
                                } // Handle download
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
                        </p> // Message when no files are present
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
            <div className="flex items-center justify-center h-screen">
              <Loader className="size-10 animate-spin" />
            </div>
          ) : assignments.length === 0 ? (
            <p className="text-gray-500">No assignments uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignments.map((assignment) => (
                <Card
                  key={assignment._id}
                  className="shadow-md border rounded-lg"
                >
                  <CardHeader className="flex flex-row gap-3 items-center">
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
            <div className="flex flex-1 overflow-scroll">
              {members.map((member) => (
                <Card key={member._id} className="shadow-md border rounded-lg">
                  <CardContent>
                    <p className="text-sm text-gray-500 mt-3 flex flex-col items-center gap-3">
                      {member.photoURL ? (
                        <img
                          src={member.photoURL}
                          alt="User Avatar"
                          className="w-8 h-8 rounded-full object-cover"
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
      </div>
    </div>
  );
};

export default TeacherClassroomDetails;
