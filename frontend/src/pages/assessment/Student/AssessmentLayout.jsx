import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import logo from "../../../assets/logo.png";
import toast from "react-hot-toast";
import MalpracticeWarning from "@/components/assessment/Malpracticewarning";
import { useAuthStore } from "@/store/auth-slice";
import { auth } from "@/lib/firebase";
const StudentExamSecurityLayout = () => {
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [isMalpracticeDetected, setIsMalpracticeDetected] = useState(false);
  const { authUser } = useAuthStore();
  useEffect(() => {
    /* if (authUser.role == "student") {
      const handleFocusLoss = () => {
        handleMalpractice();
      };

      const handleVisibilityChange = () => {
        if (document.hidden) {
          handleFocusLoss();
        }
      };

      const handleFullscreenChange = () => {
        if (!document.fullscreenElement) {
          handleFocusLoss();
        }
      };

      const handleRightClick = (event) => event.preventDefault(); // Disable right-click

      window.addEventListener("blur", handleFocusLoss); // Detect switching windows
      document.addEventListener("visibilitychange", handleVisibilityChange);
      document.addEventListener("fullscreenchange", handleFullscreenChange);
      document.addEventListener("contextmenu", handleRightClick); // Disable right-click

      return () => {
        window.removeEventListener("blur", handleFocusLoss);
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
        document.removeEventListener(
          "fullscreenchange",
          handleFullscreenChange
        );
        document.removeEventListener("contextmenu", handleRightClick);
      };
    }else{
        navigate("/");
    } */
  }, [navigate]);

  // Hide cursor after inactivity
  useEffect(() => {
    let timeout;
    const hideCursor = () => setShowCursor(false);
    const resetCursor = () => {
      setShowCursor(true);
      clearTimeout(timeout);
      timeout = setTimeout(hideCursor, 3000); // Hide cursor after 3 sec of inactivity
    };

    document.addEventListener("mousemove", resetCursor);
    timeout = setTimeout(hideCursor, 3000);

    return () => {
      document.removeEventListener("mousemove", resetCursor);
      clearTimeout(timeout);
    };
  }, []);

  const handleCloseModal = () => {
    setIsMalpracticeDetected(false);
    navigate("/student/dashboard");
  };
  return (
    <div className="w-full h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-1/5 h-full bg-white/80 backdrop-blur-md shadow-md border-r border-gray-200 flex flex-col p-6">
        {/* User Profile */}
        <div className="flex items-center space-x-4 p-4 bg-gray-50 shadow-sm rounded-lg">
          <img
            src={authUser.photoURL || "/default-avatar.png"}
            alt="User Avatar"
            className="w-14 h-14 rounded-full border-2 border-gray-400"
          />
          <div>
            <h1 className="text-lg font-semibold text-gray-800">
              {authUser.fullName}
            </h1>
            <p className="text-sm text-gray-600">{authUser.email}</p>
            <span className="text-xs font-medium text-gray-500 capitalize">
              {authUser.role}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="mt-6 space-y-3">
          <button
            onClick={() => navigate("/assessment/s/view")}
            className="flex items-center py-3 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 transition shadow-sm"
          >
            ✏️ <span className="ml-3">Your Assessments</span>
          </button>
          <button
            onClick={() => navigate("/assessment/scoreboard")}
            className="flex items-center py-3 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 transition shadow-sm"
          >
            📊 <span className="ml-3">Your Performance</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="w-4/5 h-full overflow-auto bg-gradient-to-br from-gray-50 to-white p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 tracking-wide flex items-center">
            🚀 Digi-Classroom
            <span className="text-blue-600 ml-2">Exam Portal</span>
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-900 hover:bg-black text-white px-5 py-2 rounded-lg transition shadow-md flex items-center"
          >
            ⬅ <span className="ml-2">Back</span>
          </button>
        </div>

        {/* Dynamic Content */}
        <section className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <Outlet />
        </section>
      </main>

      {/* Malpractice Warning Modal */}
      <MalpracticeWarning
        isOpen={isMalpracticeDetected}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default StudentExamSecurityLayout;
