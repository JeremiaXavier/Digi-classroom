import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth-slice";
import MalpracticeWarning from "@/components/assessment/Malpracticewarning";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ListChecks,
  BarChart3,
  Users,
  LogOut,
} from "lucide-react";

const ExamSecurityLayout = () => {
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMalpracticeDetected, setIsMalpracticeDetected] = useState(false);
  const { authUser } = useAuthStore();

  useEffect(() => {
    if (authUser.role !== "teacher") {
      navigate("/");
    }
  }, [navigate]);

  // Enter Fullscreen
  const enterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    }
  };

  // Handle Malpractice Detection
  const handleMalpractice = () => {
    setIsMalpracticeDetected(true);
  };

  // Close Malpractice Warning
  const handleCloseModal = () => {
    setIsMalpracticeDetected(false);
    navigate("/student/dashboard");
  };

  return (
    <div className="w-full h-screen flex bg-gray-100  ">
      {/* Fullscreen Confirmation */}
      {!isFullscreen ? (
        <div className="absolute inset-0 flex items-center justify-center text-center bg-black bg-opacity-50">
          <div className="p-6 bg-white shadow-xl rounded-lg text-gray-900 max-w-md w-full">
            <h2 className="text-2xl font-semibold mb-4">
              Enter Assessment Mode
            </h2>
            <p className="text-gray-600 mb-6">
              You will enter a secured environment for the exam.
            </p>
            <Button onClick={enterFullscreen} className="w-full">
              Enter Fullscreen
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Malpractice Warning */}
          <MalpracticeWarning
            isOpen={isMalpracticeDetected}
            onClose={handleCloseModal}
          />

          {/* Sidebar */}
          <aside className="w-64 bg-white shadow-lg border-r p-6 flex flex-col">
            {/* User Profile */}
            <div className="flex items-center space-x-3 pb-6 border-b">
              <img
                src={authUser.photoURL || "/default-avatar.png"}
                alt="User Avatar"
                className="w-12 h-12 rounded-full border"
              />
              <div>
                <h1 className="text-lg font-semibold">{authUser.fullName}</h1>
                <p className="text-sm text-gray-600">{authUser.email}</p>
                <span className="text-xs font-medium text-gray-500 capitalize">
                  {authUser.role}
                </span>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="mt-6 flex flex-col space-y-2">
              <SidebarButton
                icon={LayoutDashboard}
                text="Create Assessment"
                onClick={() => navigate("/assessment/create")}
              />
              <SidebarButton
                icon={ListChecks}
                text="Your Assessments"
                onClick={() => navigate("/assessment/view")}
              />
              <SidebarButton
                icon={BarChart3}
                text="View Scoreboard"
                onClick={() => navigate("/assessment/scoreboard")}
              />
              
              <SidebarButton
                icon={LogOut}
                text="Exit"
                onClick={() => navigate(-1)}
              />
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 bg-white p-8 flex flex-col h-screen">
            {/* Fixed Header */}
            <header className="flex justify-between items-center border-b pb-4 mb-4 bg-white z-10">
              <h1 className="text-2xl font-semibold text-gray-800">
                🎓 ScorePilot Web
              </h1>
              <Button variant="outline" onClick={() => navigate(-1)}>
                ⬅ Back
              </Button>
            </header>

            {/* Scrollable Outlet Content */}
            <div className="flex-1 overflow-y-auto">
              <Outlet />
            </div>
          </main>
        </>
      )}
    </div>
  );
};

// Sidebar Button Component
const SidebarButton = ({ icon: Icon, text, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-200 transition"
    )}
  >
    <Icon size={18} />
    {text}
  </button>
);
/
export default ExamSecurityLayout;
