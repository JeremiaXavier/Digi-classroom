import {
  Settings,
  LogOut,
  User,
  Home,
  Clipboard,
  PlusCircle,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import CreateClassroom from "./CreateClassroom";
import { useAuthStore } from "@/store/auth-slice";

const TeacherDashboard = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { logout, authUser } = useAuthStore();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleLogout = async () => {
    await logout();
    navigate("/signin");
  };

  return (
    <div className="flex h-screen w-screen bg-gray-100">
      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed  md:relative w-80 px-7 lg:w-1/5 bg-gray-50 text-black shadow-xl flex flex-col h-screen transition-transform duration-300 z-50 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:flex`}>

        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-20 px-4 border-b border-blue-500">
          <h1 className="text-2xl font-bold">Digi-Classroom</h1>
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-200" onClick={toggleSidebar}>
            <X size={24} />
          </button>
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
                <span>Classrooms</span>
              </Link>
            </li>
            <li>
              <Link
                to="/assessment"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-all duration-300"
              >
                <Clipboard size={24} />
                <span>Assessment Portal</span>
              </Link>
            </li>
            <li>
              <button
                onClick={openModal}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-all duration-300 w-full text-left"
              >
                <PlusCircle size={24} />
                <span>Create Classroom</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-blue-500">
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
      <main className="flex-1 p-2 bg-white overflow-scroll">
        {/* Header */}
        <header className="flex items-center justify-between p-0 md:px-2 ">
          {/* Sidebar Toggle (Mobile) */}
          <button className="ml-4 md:hidden " onClick={toggleSidebar}>
            <Menu size={24} />
          </button>

          {/* Profile & Settings */}
          <div className="flex items-center space-x-3 md:ml-auto">
            <button className="flex items-center space-x-2 px-2 py-2 text-black rounded-lg">
              <Settings size={25} />
            </button>
            <div className="relative">
              <div
                className="flex bg-white items-center rounded-lg p-2 cursor-pointer md:space-x-3 sm:flex-row"
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
                        <p className="text-sm text-gray-500">{authUser.email}</p>
                      </div>
                    </li>

                    {/* Divider */}
                    <li className="border-t border-gray-200"></li>

                    {/* Manage Profile Option */}
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                      <Link to="/manage-profile" className="flex items-center space-x-2">
                        <User size={16} />
                        <span className="text-sm">Manage Profile</span>
                      </Link>
                    </li>

                    {/* Logout Option */}
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                      <button onClick={handleLogout} className="flex items-center space-x-2 w-full">
                        <LogOut size={16} />
                        <span className="text-sm">Logout from All Sessions</span>
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-1 md:p-6">
          <Outlet />
          <CreateClassroom isOpen={isModalOpen} onClose={closeModal} />
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
