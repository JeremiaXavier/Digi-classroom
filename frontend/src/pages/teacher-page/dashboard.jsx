import {
  Settings,
  LogOut,
  User,
  Home,
  Clipboard,
  Star,
  BookOpen,
  PlusCircle,
} from "lucide-react";
import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import CreateClassroom from "./CreateClassroom";
import { useAuthStore } from "@/store/auth-slice";
import logo from "../../assets/edupilot.png";
const TeacherDashboard = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { logout, authUser } = useAuthStore();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleLogout = async () => {
    await logout();
    console.log("Logged out");
    navigate("/signin");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="flex h-screen w-screen bg-white ">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-[#af47e8] to-[#7a1cbf] text-white shadow-xl flex flex-col h-screen">
        {/* Logo */}
        <div className="flex justify-center py-6">
          <div className="bg-white p-2 rounded-lg shadow-md">
            <img src={logo} alt="App Logo" className="w-36" />
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-5">
          <ul className="space-y-3">
            <li>
              <Link
                to="c"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#9228d6] transition-all duration-300"
              >
                <Home size={22} className="text-white" />
                <span className="font-medium">Classrooms</span>
              </Link>
            </li>
            <li>
              <Link
                to="/assessment"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#9228d6] transition-all duration-300"
              >
                <Clipboard size={22} className="text-white" />
                <span className="font-medium">Assessment Portal</span>
              </Link>
            </li>
            <li>
              <button
                onClick={openModal}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#9228d6] transition-all duration-300 w-full text-left"
              >
                <PlusCircle size={22} className="text-white" />
                <span className="font-medium">Create Classroom</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-5 border-t border-[#9228d6]">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-red-600 transition-all duration-300"
          >
            <LogOut size={22} className="text-white" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-white">
        <header className="flex items-center justify-end mb-6">
          {/* Profile Avatar */}
          <button className="flex items-center space-x-2  px-3 py-2 text-black rounded-lg">
            <Settings size={25} />
          </button>
          <div className="relative">
            <div
              className="flex justify-end space-x-3 bg-slate-100 items-center rounded-lg p-2 cursor-pointer"
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
          <CreateClassroom isOpen={isModalOpen} onClose={closeModal} />
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
