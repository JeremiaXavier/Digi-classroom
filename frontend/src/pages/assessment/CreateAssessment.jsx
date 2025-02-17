import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/store/auth-slice";
import toast from "react-hot-toast";

const CreateAssessment = () => {
  const [questions, setQuestions] = useState([
    { type: "mcq", paragraph: "", question: "", choices: ["", ""], answer: "" },
  ]);
  const {idToken} = useAuthStore();
  const [title,setTitle] = useState("");
  // Add a new question
  const addQuestion = (type) => {
    setQuestions([
      ...questions,
      type === "paragraph"
        ? { type: "paragraph", paragraph: "", question: "" }
        : { type: "mcq", paragraph: "", question: "", choices: ["", ""], answer: "" },
    ]);
  };

  // Update question text
  const handleQuestionChange = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].question = value;
    setQuestions(updatedQuestions);
  };

  // Update paragraph text
  const handleParagraphChange = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].paragraph = value;
    setQuestions(updatedQuestions);
  };

  // Update choices
  const handleChoiceChange = (qIndex, cIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].choices[cIndex] = value;
    setQuestions(updatedQuestions);
  };

  // Set correct answer from radio selection
  const handleAnswerChange = (qIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].answer = value;
    setQuestions(updatedQuestions);
  };

  // Add choice to MCQ
  const addChoice = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].choices.push("");
    setQuestions(updatedQuestions);
  };

  // Handle form submission
  const handleSubmit = async() => {
    try {
      const response = await axiosInstance.post("/assess/create",{title,questions},{
        headers: { Authorization: `Bearer ${idToken}` },
      })
      console.log("Assessment Submitted:", questions);
    toast.success("Assessment Created Successfully!");
    } catch (error) {
      toast.error(error.message);
    }  
  };
  console.log(questions)
  return (
    <div className="w-full h-[90vh] overflow-scroll p-6 bg-white flex flex-col items-center">
      <h1 className="text-3xl text-black font-bold mb-6">📝 Create </h1>

      <div className="max-w-3xl w-full text-black bg-white p-6 rounded-lg shadow">
      <label className="block font-extrabold text-gray-700 font-medium mt-3 mb-2">
              Name of Assessment
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded mb-10"
              placeholder="Enter your assessment name"
            />
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="mb-6">
            {/* Question Number */}
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              Question {qIndex + 1}
            </h2>

            {/* Optional Paragraph Input */}
            {q.type === "mcq" && (
              <>
                <label className="block text-gray-700 font-medium mb-2">
                  Add Paragraph (Optional):
                </label>
                <textarea
                  value={q.paragraph}
                  onChange={(e) => handleParagraphChange(qIndex, e.target.value)}
                  className="w-full p-2 border rounded"
                  rows="4"
                  placeholder="Enter paragraph (if needed)"
                />
              </>
            )}

            {/* Question Input */}
            <label className="block text-gray-700 font-medium mt-3">
              {q.type === "paragraph" ? "Paragraph Question:" : "Question:"}
            </label>
            <input
              type="text"
              value={q.question}
              onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter your question"
            />

            {/* MCQ Choices */}
            {q.type === "mcq" && (
              <>
                <label className="block text-gray-700 font-medium mt-3">
                  Choices:
                </label>
                {q.choices.map((choice, cIndex) => (
                  <div key={cIndex} className="flex items-center mt-1">
                    <input
                      type="radio"
                      name={`answer-${qIndex}`}
                      value={choice}
                      checked={q.answer === choice}
                      onChange={() => handleAnswerChange(qIndex, choice)}
                      className="mr-2"
                    />
                    <input
                      type="text"
                      value={choice}
                      onChange={(e) =>
                        handleChoiceChange(qIndex, cIndex, e.target.value)
                      }
                      className="w-full p-2 border rounded"
                      placeholder={`Choice ${cIndex + 1}`}
                    />
                  </div>
                ))}
                <button
                  onClick={() => addChoice(qIndex)}
                  className="mt-2 text-blue-600 text-sm"
                >
                  ➕ Add Choice
                </button>
              </>
            )}

            {/* Paragraph-Based Answer Input */}
            {q.type === "paragraph" && (
              <>
                <label className="block text-gray-700 font-medium mt-3">
                  Answer:
                </label>
                <textarea
                  className="w-full p-2 border rounded mt-1"
                  rows="4"
                  placeholder="Enter answer"
                ></textarea>
              </>
            )}
          </div>
        ))}

        {/* Buttons to Add Questions */}
        <div className="flex gap-4 mt-6">
          <Button onClick={() => addQuestion("mcq")} className="bg-blue-600">
            ➕ Add MCQ
          </Button>
          <Button onClick={() => addQuestion("paragraph")} className="bg-green-600">
            ➕ Add Paragraph Question
          </Button>
        </div>

        {/* Submit Button */}
        <div className="mt-8 text-center">
          <Button onClick={handleSubmit} className="bg-purple-600 px-6 py-3 text-lg">
            ✅ Submit Assessment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateAssessment;
