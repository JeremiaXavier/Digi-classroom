import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const TeacherSidebar = () => {
  const navigate = useNavigate();

  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col p-4 gap-4">
      <h2 className="text-xl font-semibold">Teacher Panel</h2>
      <Button onClick={() => navigate("/assessment/create")} className="bg-blue-600 hover:bg-blue-700 w-full">
        ✏️ Create Assessment
      </Button>
      <Button onClick={() => navigate("/assessment/scoreboard")} className="bg-green-600 hover:bg-green-700 w-full">
        📊 View Scoreboard
      </Button>
      <Button onClick={() => navigate("/assessment/manage-students")} className="bg-purple-600 hover:bg-purple-700 w-full">
        🎓 Manage Students
      </Button>
    </div>
  );
};

export default TeacherSidebar;
