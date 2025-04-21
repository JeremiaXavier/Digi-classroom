import { useAuthStore } from "@/store/auth-slice";
import {
  Menu,
  Settings,
  LogOut,
  User,
  Home,
  Clipboard,
  Stamp,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, Outlet, useNavigate } from "react-router-dom";
import logo from "../../assets/edupilot.png"
const StudentDashboard = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar state for mobile
  const navigate = useNavigate();
  const { logout, authUser } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/signin");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <div className="flex w-screen h-screen">
      {/* Sidebar - Hidden on small screens */}
      <aside
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed md:static w-64 bg-gradient-to-b from-[#af47e8] to-[#7a1cbf] text-white shadow-xl flex flex-col h-screen transition-transform duration-300 md:translate-x-0 z-50`}
      >
        {/* Logo */}
        <div className="flex justify-between items-center p-4 md:justify-center">
          <div className="flex justify-center py-6">
            <div className="bg-white p-2 rounded-lg shadow-md">
              <img src={logo} alt="App Logo" className="w-36" />
            </div>
          </div>
          <button className="md:hidden text-white" onClick={()=>setIsSidebarOpen(false)}>
            ✕
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4">
          <ul className="space-y-4">
            <li>
              <Link
                to="c"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#7618a9] transition"
              >
                <Home size={24} />
                <span>Classrooms</span>
              </Link>
            </li>
            <li>
              <Link
                to="join"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#7618a9] transition"
              >
                <Stamp size={24} />
                <span>Join</span>
              </Link>
            </li>
            
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-300">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-gray-200 transition"
          >
            <LogOut size={24} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-2 bg-white">      {/* Header */}
        <header className="flex items-center justify-between px-4 py-2 shadow-md md:shadow-none">
          {/* Menu Button for Mobile */}
          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden">
            <Menu size={28} />
          </button>

          {/* Profile & Settings */}
          <div className="flex items-center space-x-3 md:ml-auto">
            {/* <button className="flex items-center space-x-2 px-3 py-2 text-black rounded-lg">
              <Settings size={25} />
            </button> */}
            <div className="relative">
              <div
                className="flex items-center rounded-lg p-2 cursor-pointer md:space-x-3 sm:flex-row"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <img
                  src={authUser.photoURL}
                  referrerPolicy="no-referrer"
                  alt="Profile Avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="text-gray-700 font-medium hidden sm:inline md:ml-2">
                  {authUser.fullName}
                </span>
              </div>

              {/* Dropdown menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 p-6 bg-white rounded-lg shadow-lg z-10">
                  <ul className="py-2 text-gray-700">
                    {/* Profile card */}
                    <li className="flex flex-col items-center space-y-2 px-4 py-3 hover:bg-gray-100 cursor-pointer">
                      <img
                        src={authUser.photoURL}
                        referrerPolicy="no-referrer"
                        alt="Profile Avatar"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="text-center">
                        <p className="text-lg font-semibold">
                          {authUser.fullName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {authUser.email}
                        </p>
                      </div>
                    </li>

                    {/* Divider */}
                    <li className="border-t border-gray-200"></li>

                    {/* Manage Profile Option */}
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                      <Link
                        to="/manage-profile"
                        className="flex items-center space-x-2"
                      >
                        <User size={16} />
                        <span className="text-sm">Manage Profile</span>
                      </Link>
                    </li>

                    {/* Logout Option */}
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full"
                      >
                        <LogOut size={16} />
                        <span className="text-sm">
                          Logout from All Sessions
                        </span>
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="bg-white h-full rounded-lg p-1 md:px-6 overflow-scroll">        <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
