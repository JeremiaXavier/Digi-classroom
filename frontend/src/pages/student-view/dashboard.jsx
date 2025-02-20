import { useAuthStore } from "@/store/auth-slice";
import { Settings, LogOut, User, Home, Clipboard, Star, PlusCircle, HomeIcon, StarOff, Stamp } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, Outlet, useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State to handle dropdown visibility
  const navigate = useNavigate();
  const {logout,authUser} = useAuthStore();

  const handleLogout = async () => {
    try {
      // Add your logout logic here
      await logout();  // Ensure this function returns a promise for the process to complete
      navigate("/signin");  // Redirect to login page after logout
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
      {/* Header */}
      <aside className="w-64 bg-gray-50 text-blcck shadow-xl flex flex-col h-screen">
        {/* Logo */}
        <div className="flex items-center justify-center h-20 border-b border-gray-500">
          <h1 className="text-2xl font-bold">Digi-Classroom</h1>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4">
          <ul className="space-y-4">
            
          <li>
              <Link
                to="c"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-all duration-300"
              >
                <Home size={24} />
                <span> Classrooms</span>
              </Link>
            </li>
            <li>
              <Link
                to="join"
                className="flex items-center space-x-3 p-3 rounded-lg  hover:bg-gray-200 transition-all duration-300"
              >
                <Stamp size={24} />
                <span>Join</span>
              </Link>
            </li>
            <li>
              <Link
                to="../assessment/s"
                className="flex items-center space-x-3 p-3 rounded-lg  hover:bg-gray-200 transition-all duration-300"
              >
                <Clipboard size={24} />
                <span>Assessments</span>
              </Link>
            </li>
            
            
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-500">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-gray-200 transition-all duration-300"
          >
            <LogOut size={24} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-2 bg-white">
        <header className="flex items-center justify-end ">
          {/* Profile Avatar */}
          <button className="flex items-center space-x-2  px-3 py-2 text-black rounded-lg">
            <Settings size={25} />
          </button>
          <div className="relative">
            <div
              className="flex justify-end space-x-3 bg-white items-center rounded-lg p-2 cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)} // Toggles the dropdown
            >
              <img
                src={authUser.photoURL}
                referrerPolicy="no-referrer"
                alt="Profile Avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="text-gray-700 font-medium">
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
                      <p className="text-sm text-gray-500">{authUser.email}</p>
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
                      <span className="text-sm">Logout from All Sessions</span>
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Settings Button */}
        </header>

        <div className="bg-white h-full rounded-lg p-6">
          <Outlet />
          
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
