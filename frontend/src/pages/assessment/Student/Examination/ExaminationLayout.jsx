import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/store/auth-slice";
import toast from "react-hot-toast";
import MalpracticeWarning from "@/components/assessment/Malpracticewarning.jsx";
import ExamWarningModal from "@/components/assessment/ExamwarningModel.jsx";

const ExaminationPage = () => {
  const { id } = useParams();
  const { authUser } = useAuthStore();
  const [assessment, setAssessment] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes timer
  const [answers, setAnswers] = useState({});
  const { idToken } = useAuthStore();
  const [isMalpracticeDetected, setIsMalpracticeDetected] = useState(false);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const navigate = useNavigate();
  const [fullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const response = await axiosInstance.get(`/assess/s/${id}`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (response.status === 200) {
          setAssessment(response.data);
        }
      } catch (error) {
        toast.error("Failed to load assessment.");
      }
    };

    fetchAssessment();
  }, [id]);

  const enterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    }

  };

  
  useEffect(() => {
    if (authUser.role == "student") {
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
    } else {
      navigate("/");
    }
  }, [navigate]);
  const handleMalpractice = () => {
    setIsMalpracticeDetected(true); // Show the warning modal
  };

  const handleCloseModal = () => {
    setIsMalpracticeDetected(false);
    navigate("/student/dashboard");
  };

  const handleStartExam = () => {
    enterFullscreen();
    setIsExamStarted(true);
  };
  
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswerSelect = (questionId, choice) => {
    setAnswers({ ...answers, [questionId]: choice });
  };

  if (!assessment) return <p>Loading...</p>;

  const question = assessment.questions[currentQuestion];

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <ExamWarningModal isOpen={!isExamStarted} onStartExam={handleStartExam} />
      <MalpracticeWarning
        isOpen={isMalpracticeDetected}
        onClose={handleCloseModal}
      />
      <header className="flex justify-between items-center p-4 bg-gray-900 text-white">
        <div className="flex items-center space-x-4">
          <img
            src={authUser.photoURL || "/default-avatar.png"}
            alt="User"
            className="w-10 h-10 rounded-full"
          />
          <span className="text-lg font-semibold">{authUser.fullName}</span>
        </div>
        <span className="text-xl font-bold">
          ⏳ {Math.floor(timeLeft / 60)}:
          {String(timeLeft % 60).padStart(2, "0")}
        </span>
        <span className="text-lg">
          {question.type === "mcq" ? "MCQ" : "Paragraph"}
        </span>
      </header>

      {/* Main Exam Content */}
      <div className="flex flex-1">
        {/* Left Column */}
        <div className="w-1/2 p-6 border-r">
          {question.type === "mcq" && question.paragraph && (
            <div className="bg-gray-100 p-4 rounded">
              <h2 className="font-bold text-lg">📖 Read the Paragraph</h2>
              <p>{question.paragraph}</p>
            </div>
          )}
          {question.type === "paragraph" && (
            <h2 className="text-2xl font-semibold">{question.question}</h2>
          )}
        </div>

        {/* Right Column */}
        <div className="w-1/2 p-6">
          {question.type === "mcq" ? (
            <div>
              <h2 className="text-2xl font-semibold">{question.question}</h2>
              <div className="mt-4">
                {question.choices.map((choice, index) => (
                  <label
                    key={index}
                    className="block bg-gray-200 p-3 rounded cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="mcq"
                      value={choice.text}
                      onChange={() =>
                        handleAnswerSelect(question._id, choice.text)
                      }
                      className="mr-2"
                    />
                    {choice.text}
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <textarea
              className="w-full h-40 p-3 border rounded"
              placeholder="Type your answer here..."
              onChange={(e) => handleAnswerSelect(question._id, e.target.value)}
            />
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <footer className="flex justify-between p-4 bg-gray-50">
        <button
          className="px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50"
          disabled={currentQuestion === 0}
          onClick={() => setCurrentQuestion(currentQuestion - 1)}
        >
          Previous
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => {
            if (currentQuestion < assessment.questions.length - 1) {
              setCurrentQuestion(currentQuestion + 1);
            } else {
              toast.success("Exam submitted!");
            }
          }}
        >
          {currentQuestion < assessment.questions.length - 1
            ? "Next"
            : "Submit"}
        </button>
      </footer>
    </div>
  );
};

export default ExaminationPage;
