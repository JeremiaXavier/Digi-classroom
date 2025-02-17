import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import logo from "../../../assets/logo.png";
import toast from "react-hot-toast";
const ExamSecurityLayout = () => {
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

   /* useEffect(() => {
    const handleFocusLoss = () => {
      toast.error("Malpractice detected! Redirecting to dashboard.");
      navigate("/student/dashboard");
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
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("contextmenu", handleRightClick);
    };
  }, [navigate]);  */

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

  const enterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    }
  };

  return (
    <div
      className={`w-full h-screen flex items-center justify-center bg-black text-white relative ${
        showCursor ? "" : "cursor-none"
      }`}
    >
      {!isFullscreen ? (
        <div className="text-center">
          <p className="mb-4 text-lg font-bold">Confirm! Enter to Assessment portal</p>
          <button
            onClick={enterFullscreen}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-lg"
          >
            Enter 
          </button>
        </div>
      ) : (
        <>
          <div className="absolute top-0 left-0 text-3xl p-4 font-bold bg-white w-full text-gray-700">
                Digi-Classroom online Examination Portal
          </div>
        
          <Outlet/>
      <div className="absolute bottom-0 w-full text-center bg-black text-white py-3 flex justify-between items-center px-6">
  {/* Warning Message */}
  <span className="text-yellow-400 font-medium">
    ⚠️ Warning: Do not switch tabs, minimize, or press escape key!
  </span>

  {/* Powered by Logo */}
  <div className="flex items-center gap-2">
    <span className="text-gray-300 text-sm">Powered by</span>
    <img
      src={logo}  // Replace with your actual logo path
      alt="Logo"
      className="h-4"
    />
  </div>

  {/* Exit Button */}
  <button
    onClick={() => window.location.href = "/student/dashboard"} // Redirects user on exit
    className=" hover:bg-red-800 text-white px-4 py-2 rounded"
  >
    🔴 Exit
  </button>
</div>

        </>
      )}
    </div>
  );
};

export default ExamSecurityLayout;
 