import { useAuthStore } from "@/store/auth-slice";
import {
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
import logo from "../../assets/edupilot.png";
const StudentDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, authUser } = useAuthStore();

  const handleLogout = async () => {
    try {
      // Add your logout logic here
      await logout(); // Ensure this function returns a promise for the process to complete
      navigate("/signin"); // Redirect to login page after logout
    } catch (error) {
      console.error("Logout failed:", error);
      // You can display an error message to the user if necessary
      toast.error("Logout failed. Please try again.");
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen); // Toggle dropdown visibility
  };

  return (
    <div className="flex w-screen h-screen bg-gray-50">
    {/* Sidebar (Hidden on Mobile, Opens on Click) */}
    <aside
      className={`fixed md:relative top-0 left-0 h-screen w-64 bg-gray-50 shadow-xl z-20 transform ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 transition-transform duration-300`}
    >
      {/* Logo */}
      <div className="flex justify-center my-6">
        <img src={logo} alt="App Logo" className="w-48" />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4">
        <ul className="space-y-4">
          <li>
            <Link to="c" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition">
              <Home size={24} />
              <span>Classrooms</span>
            </Link>
          </li>
          <li>
            <Link to="join" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition">
              <Stamp size={24} />
              <span>Join</span>
            </Link>
          </li>
          <li>
            <Link to="../assessment/s" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition">
              <Clipboard size={24} />
              <span>Assessments</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-500">
        <button onClick={handleLogout} className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-gray-200 transition">
          <LogOut size={24} />
          <span>Logout</span>
        </button>
      </div>
    </aside>

    {/* Mobile Sidebar Toggle Button */}
    <button
      className="absolute top-4 left-4 md:hidden bg-gray-200 p-2 rounded-full shadow-md"
      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
    >
      <Menu size={24} />
    </button>

    {/* Main Content */}
    <main className="flex-1 p-4 md:ml-64 transition-all">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
        {/* Mobile Sidebar Button (Hidden on Desktop) */}
        <button className="md:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <Menu size={24} />
        </button>

        {/* Profile Avatar & Dropdown */}
        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-lg hover:bg-gray-200 transition">
            <Settings size={25} />
          </button>

          <div className="relative">
            <div
              className="flex items-center space-x-3 cursor-pointer p-2 bg-white rounded-lg"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <img src={authUser.photoURL} referrerPolicy="no-referrer" alt="Profile" className="w-10 h-10 rounded-full" />
              <span className="text-gray-700 font-medium hidden sm:inline">{authUser.fullName}</span>
            </div>

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
                <ul className="py-2 text-gray-700">
                  <li className="flex flex-col items-center px-4 py-3 hover:bg-gray-100 cursor-pointer">
                    <img src={authUser.photoURL} referrerPolicy="no-referrer" alt="Profile" className="w-16 h-16 rounded-full" />
                    <div className="text-center">
                      <p className="text-lg font-semibold">{authUser.fullName}</p>
                      <p className="text-sm text-gray-500">{authUser.email}</p>
                    </div>
                  </li>
                  <li className="border-t border-gray-200"></li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    <Link to="/manage-profile" className="flex items-center space-x-2">
                      <User size={16} />
                      <span className="text-sm">Manage Profile</span>
                    </Link>
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    <button onClick={handleLogout} className="flex items-center space-x-2 w-full">
                      <LogOut size={16} />
                      <span className="text-sm">Logout</span>
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="bg-white h-full rounded-lg p-6">
        <Outlet />
      </div>
    </main>
  </div>
);
};


export default StudentDashboard;
