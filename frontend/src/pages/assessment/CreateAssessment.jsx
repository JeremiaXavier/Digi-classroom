import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/store/auth-slice";
import toast from "react-hot-toast";
import Switcher from "@/components/assessment/Switcher";
import { Plus, Send, Trash2 } from "lucide-react";

const CreateAssessment = () => {
  const [questions, setQuestions] = useState([
    { type: "mcq", paragraph: "", question: "", choices: ["", ""], answer: "" },
  ]);
  const { idToken } = useAuthStore();
  const [title, setTitle] = useState("");

  // Add a new question
  const addQuestion = (type) => {
    setQuestions([
      ...questions,
      type === "paragraph"
        ? { type: "paragraph", paragraph: "", question: "", answer: "" }
        : {
            type: "mcq",
            paragraph: "",
            question: "",
            choices: [
              { text: "", isCorrect: false },
              { text: "", isCorrect: false },
            ],
            isMultiple: false,
          },
    ]);
  };

  // Remove a question
  const removeQuestion = (index) => {
    if (questions.length === 1) {
      toast.error("At least one question is required!");
      return;
    }
    setQuestions(questions.filter((_, i) => i !== index));
  };

  // Update question text
  const handleQuestionChange = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].question = value;
    setQuestions(updatedQuestions);
  };

  // Update choices
  const handleChoiceChange = (qIndex, cIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].choices[cIndex].text = value;
    setQuestions(updatedQuestions);
  };

  // Set correct answer
  const handleChoiceAnswerChange = (qIndex, cIndex) => {
    const updatedQuestions = [...questions];

    if (updatedQuestions[qIndex].isMultiple) {
      updatedQuestions[qIndex].choices[cIndex].isCorrect =
        !updatedQuestions[qIndex].choices[cIndex].isCorrect;
    } else {
      updatedQuestions[qIndex].choices = updatedQuestions[qIndex].choices.map(
        (choice, index) => ({
          ...choice,
          isCorrect: index === cIndex,
        })
      );
    }
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async () => {
    try {
      await axiosInstance.post(
        "/assess/create",
        { title, questions },
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );
      toast.success("Assessment Created Successfully!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-white">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-lg p-8">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
          📝New Assessment 
        </h1>

        {/* Assessment Title */}
        <div className="mb-6">
          <label className="block font-bold text-gray-700">Assessment Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
            placeholder="Enter assessment title"
          />
        </div>

        {/* Questions List */}
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="bg-gray-50 p-5 rounded-lg mb-4 shadow-sm relative">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-700">
                Question {qIndex + 1}
              </h2>
              <button
                onClick={() => removeQuestion(qIndex)}
                className="text-red-600 hover:text-red-800 flex items-center gap-1"
              >
                <Trash2 size={18} /> Discard
              </button>
            </div>

            {q.type === "mcq" && (
              <>
                <label className="text-gray-700 font-medium">Optional Paragraph:</label>
                <textarea
                  value={q.paragraph}
                  onChange={(e) =>
                    setQuestions(
                      questions.map((ques, index) =>
                        index === qIndex ? { ...ques, paragraph: e.target.value } : ques
                      )
                    )
                  }
                  className="w-full p-3 border rounded mt-2"
                  placeholder="Enter paragraph (optional)"
                />
              </>
            )}

            {/* Question Input */}
            <label className="text-gray-700 font-medium mt-3 block">Question:</label>
            <input
              type="text"
              value={q.question}
              onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
              className="w-full p-3 border rounded mt-2"
              placeholder="Enter question"
            />

            {/* MCQ Choices */}
            {q.type === "mcq" && (
              <>
                <div className="flex justify-between items-center mt-4">
                  <h2 className="font-medium">Enable Multiple Answers</h2>
                  <Switcher
                    isChecked={q.isMultiple}
                    setIsChecked={() => {
                      const updatedQuestions = [...questions];
                      updatedQuestions[qIndex].isMultiple = !q.isMultiple;
                      updatedQuestions[qIndex].choices = updatedQuestions[qIndex].choices.map((choice) => ({
                        ...choice,
                        isCorrect: false,
                      }));
                      setQuestions(updatedQuestions);
                    }}
                  />
                </div>

                {/* Choices */}
                <label className="block text-gray-700 font-medium mt-3">Choices:</label>
                {q.choices.map((choice, cIndex) => (
                  <div key={cIndex} className="flex items-center gap-3 mt-2">
                    <input
                      type={q.isMultiple ? "checkbox" : "radio"}
                      name={`answer-${qIndex}`}
                      checked={choice.isCorrect}
                      onChange={() => handleChoiceAnswerChange(qIndex, cIndex)}
                      className="mr-2"
                    />
                    <input
                      type="text"
                      value={choice.text}
                      onChange={(e) => handleChoiceChange(qIndex, cIndex, e.target.value)}
                      className="w-full p-2 border rounded"
                      placeholder={`Choice ${cIndex + 1}`}
                    />
                  </div>
                ))}

                <button
                  onClick={() =>
                    setQuestions((prev) =>
                      prev.map((ques, index) =>
                        index === qIndex
                          ? { ...ques, choices: [...ques.choices, { text: "", isCorrect: false }] }
                          : ques
                      )
                    )
                  }
                  className="mt-3 text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Plus size={16} /> Add Choice
                </button>
              </>
            )}
          </div>
        ))}

        {/* Add Question Buttons */}
        <div className="flex gap-4 mt-6 justify-center">
          <Button onClick={() => addQuestion("mcq")} className="bg-blue-600 hover:bg-blue-700">
            ➕ Add MCQ
          </Button>
          <Button onClick={() => addQuestion("paragraph")} className="bg-green-600 hover:bg-green-700">
            ➕ Add Paragraph Question
          </Button>
        </div>

        {/* Submit Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={handleSubmit}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 text-lg flex items-center gap-2"
          >
            <Send size={20} /> Submit Assessment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateAssessment;
