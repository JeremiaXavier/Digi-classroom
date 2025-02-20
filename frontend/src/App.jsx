import { Toaster } from "react-hot-toast";
import CheckAuth from "./components/auth/CheckAuth.jsx";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import AuthLogin from "./pages/auth/LoginPage";
import AuthRegister from "./pages/auth/RegisterUser";
import StudentDashboard from "./pages/student-view/dashboard.jsx";
import TeacherDashboard from "./pages/teacher-page/dashboard.jsx";
import Classrooms from "./pages/student-view/StudentClassrooms.jsx";
import Classmates from "./components/students/Classmates.jsx";
import Assignments from "./components/students/Assignments.jsx";
import Grades from "./components/students/Grades.jsx";
import ClassroomDetails from "./components/students/ClassroomDetails.jsx";
import ManageClassrooms from "./pages/teacher-page/ManageClassrooms.jsx";
import CreateClassroom from "./pages/teacher-page/CreateClassroom.jsx";
import { useEffect, useState } from "react";
import { useAuthStore } from "./store/auth-slice/index.js";
import CheckRole from "./components/auth/CheckRole.jsx";
import { Loader } from "lucide-react";
import { auth } from "./lib/firebase.js";
import { axiosInstance } from "./lib/axios.js";
import TeacherClassroomDetails from "./pages/teacher-page/ClassroomDetails.jsx";
import StudentClassrooms from "./pages/student-view/StudentClassrooms.jsx";
import StudentClassroomDetails from "./pages/student-view/StudentClassroomDetails.jsx";
import JoinClassroom from "./components/students/JoinClassroom.jsx";
import LandingPage from "./pages/assessment/WelcomePage.jsx";
import CreateAssessment from "./pages/assessment/CreateAssessment.jsx";
import TeacherAssessmentsPage from "./pages/assessment/TeacherAssessments.jsx";
import ExamSecurityLayout from "./pages/assessment/Layer/AssessmentSecurityLayout.jsx";
import StudentExamSecurityLayout from "./pages/assessment/Student/AssessmentLayout.jsx";
import StudentAssessments from "./pages/assessment/Student/ViewAssessments.jsx";
import ExaminationPage from "./pages/assessment/Student/Examination/ExaminationLayout.jsx";

function App() {
  const { authUser, isAuthenticated, set } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdToken(true);
        try {
          const res = await axiosInstance.get("/auth/check", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          set({ authUser: res.data, isAuthenticated: true, idToken: token });
          setIsLoading(false);
        } catch (error) {
          // Handle errors from the backend (e.g., network issues, etc.)
          console.error("Error checking auth:", error);
        }
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribe(); // Cleanup listener when component unmounts
    };
  }, [navigate, isAuthenticated, set]);

  if (isLoading && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }
  return (
    <div className="flex flex-col overflow-hidden bg-white">
      <Toaster position="top-right" />

      <Routes>
        <Route
          path="signin"
          element={isAuthenticated ? <Navigate to="/" /> : <AuthLogin />}
        />
        <Route
          path="signup"
          element={isAuthenticated ? <Navigate to="/" /> : <AuthRegister />}
        />
        <Route path="/" element={<CheckAuth />}></Route>
        <Route path="assessment" element={<ExamSecurityLayout />}>
          <Route path="" element={<LandingPage />} />
          <Route path="create" element={<CreateAssessment />} />
          <Route path="view" element={<TeacherAssessmentsPage />} />
        </Route>
        <Route path="assessment/s" element={<StudentExamSecurityLayout />}>
          <Route path="" element={<LandingPage />} />
          

          <Route path="view" element={<StudentAssessments />} />
        </Route>
        <Route path="assessment/s/start/:id" element={<ExaminationPage />} />
        <Route
          path="student/dashboard"
          element={
            <CheckRole isAuthenticated={isAuthenticated} user={authUser}>
              <StudentDashboard />
            </CheckRole>
          }
        >
          <Route path="c/:id" element={<StudentClassroomDetails />} />
          <Route path="c" element={<StudentClassrooms />} />
          <Route path="r" element={<Classmates />} />
          <Route path="a" element={<Assignments />} />
          <Route path="g" element={<Grades />} />
          <Route path="join" element={<JoinClassroom />} />
        </Route>
        <Route
          path="teacher/dashboard"
          element={
            <CheckRole isAuthenticated={isAuthenticated} user={authUser}>
              <TeacherDashboard />
            </CheckRole>
          }
        >
          <Route path="c/:id" element={<TeacherClassroomDetails />} />
          <Route path="c" element={<ManageClassrooms />} />
          <Route path="a" element={<Assignments />} />
          <Route path="g" element={<Grades />} />
          <Route path="create" element={<CreateClassroom />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
