import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-slice";

const LandingPage = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const user = authUser;

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      {/* Assessment Panel Header */}
      
      {/* Main Content */}
      <div className="max-w-3xl w-full bg-white shadow-lg rounded-lg p-6 text-center">
        {/* User Profile Section */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={user.photoURL || "/default-avatar.png"} // Default image if none provided
            alt="User Avatar"
            referrerPolicy="no-referer"
            className="w-20 h-20 rounded-full border border-gray-300 shadow"
          />
          <h1 className="text-2xl text-gray-600 font-bold mt-3">{user.fullName}</h1>
          <p className="text-gray-600">{user.email}</p>
          <span className="text-sm font-medium text-gray-500 capitalize">
            {user.role}
          </span>
        </div>

        {/* Role-based Actions */}
        {user.role === "teacher" ? (
          <div className="flex flex-col gap-4">
            <Button
              onClick={() => navigate("/assessment/create")}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              ✏️ Create Assessment
            </Button>
            <Button
              onClick={() => navigate("/assessment/scoreboard")}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
            >
              📊 View Scoreboard
            </Button>
            <Button
              onClick={() => navigate("/assessment/manage-students")}
              className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded"
            >
              🎓 Manage Students
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {user.assessments.length > 0 ? (
              user.assessments.map((assessment) => (
                <Button
                  key={assessment.id}
                  onClick={() => navigate(`/assessment/${assessment.id}`)}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                >
                  📖 {assessment.title}
                </Button>
              ))
            ) : (
              <p className="text-gray-500">No assessments assigned yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
