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
  ClipboardList,
} from "lucide-react";
import logo from "../../../assets/image.png";

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

  const enterFullscreen = () => {
    
      setIsFullscreen(true);
    
  };



  return (
    <div className="w-full h-screen flex bg-gray-50">
      {!isFullscreen ? (
        <div className="absolute inset-0 flex items-center justify-center text-center bg-white bg-opacity-80 backdrop-blur-md">
          <div className="p-8 bg-white shadow-2xl rounded-2xl text-gray-900 max-w-lg w-full">
            <div className="flex justify-center mb-6">
              <img src={logo} alt="App Logo" className="w-40" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Secure Exam Mode
            </h2>
            <p className="text-gray-600 mb-6">
              You are about to enter a secure environment for the exam.
            </p>
            <Button onClick={enterFullscreen} className="w-full text-lg">
              Enter 
            </Button>
          </div>
        </div>
      ) : (
        <>


          {/* Sidebar */}
          <aside className="w-72 bg-white shadow-lg border-r p-6 flex flex-col">
            <div className="flex justify-center">
              <img src={logo} alt="App Logo" className="w-48" />
            </div>

            <nav className="mt-8 flex flex-col gap-3">
              <SidebarButton icon={LayoutDashboard} text="Create Assessment" onClick={() => navigate("/assessment/create")} />
              <SidebarButton icon={ListChecks} text="Your Assessments" onClick={() => navigate("/assessment/view")} />
              <SidebarButton icon={BarChart3} text="View Scoreboard" onClick={() => navigate("/assessment/scoreboard")} />
              <SidebarButton icon={ClipboardList} text="Evaluate" onClick={() => navigate("/assessment/evaluate")} />
              <SidebarButton icon={LogOut} text="Exit" onClick={() => navigate("/teacher/dashboard")} />
            </nav>

            <div className="mt-auto border-t pt-4 flex items-center gap-3">
              <img src={authUser.photoURL || "/default-avatar.png"} alt="User Avatar" className="w-12 h-12 rounded-full border shadow" />
              <div>
                <h1 className="text-lg font-semibold">{authUser.fullName}</h1>
                <p className="text-sm text-gray-600">{authUser.email}</p>
                <span className="text-xs font-medium text-gray-500 capitalize">{authUser.role}</span>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-8 flex flex-col h-screen">
            <header className="flex justify-between items-center  pb-2 mb-6 bg-white z-10  p-4">
              <h1 className="text-2xl font-semibold text-gray-800">Exam Dashboard</h1>
              <Button variant="outline" onClick={() => navigate(-1)} className="px-4 py-2">
                ⬅ Back
              </Button>
            </header>

            <div className="flex-1 overflow-y-auto">
              <Outlet />
            </div>
          </main>
        </>
      )}
    </div>
  );
};

const SidebarButton = ({ icon: Icon, text, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-4 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition shadow-sm"
    )}
  >
    <Icon size={20} className="text-blue-600" />
    <span className="font-medium">{text}</span>
  </button>
);

export default ExamSecurityLayout;
