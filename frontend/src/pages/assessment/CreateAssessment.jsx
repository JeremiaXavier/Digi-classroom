import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/store/auth-slice";
import toast from "react-hot-toast";
import Switcher from "@/components/assessment/Switcher";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const CreateAssessment = () => {
  const [isChecked, setIsChecked] = useState(false);

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
            answer: "",
            isMultiple: false,
          },
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
    updatedQuestions[qIndex] = {
      ...updatedQuestions[qIndex],
      choices: updatedQuestions[qIndex].choices.map((choice, index) =>
        index === cIndex ? { ...choice, text: value } : choice
      ),
    };
    setQuestions(updatedQuestions);
  };

  // Set correct answer from radio selection
  const handleChoiceAnswerChange = (qIndex, cIndex) => {
    const updatedQuestions = [...questions];

    if (updatedQuestions[qIndex].isMultiple) {
      // ✅ Allow multiple answers (toggle checkbox)
      updatedQuestions[qIndex].choices[cIndex].isCorrect =
        !updatedQuestions[qIndex].choices[cIndex].isCorrect;
    } else {
      // ✅ Only allow one correct answer (radio button behavior)
      updatedQuestions[qIndex].choices = updatedQuestions[qIndex].choices.map(
        (choice, index) => ({
          ...choice,
          isCorrect: index === cIndex, // Set only the selected choice to true
        })
      );
    }

    setQuestions(updatedQuestions);
  };

  const handleAnswerChange = (qIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].answer = value;
    setQuestions(updatedQuestions);
  };

  // Add choice to MCQ
  const addChoice = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].choices.push({ text: "", isCorrect: false });
    setQuestions(updatedQuestions);
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const response = await axiosInstance.post(
        "/assess/create",
        { title, questions },
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      console.log("Assessment Submitted:", questions);
      toast.success("Assessment Created Successfully!");
    } catch (error) {
      toast.error(error.message);
    }
  };
  console.log(questions);
  return (
    <div className="w-full h-[90vh] overflow-scroll p-6 bg-white flex flex-col items-center">
      <h1 className="text-3xl text-black font-bold mb-6">📝 Create </h1>

      <Card className="w-full max-w-4xl p-6 shadow-lg bg-white rounded-xl">
        <CardContent>
        <label className="block text-xl font-semibold mb-2">Assessment Title</label>
        <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter assessment name" />
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="mt-6 p-4 border rounded-lg bg-gray-100">
            {/* Question Number */}
            <h2 className="text-lg font-semibold mb-2">
              Question {qIndex + 1}
            </h2>

            {/* Optional Paragraph Input */}
            {q.type === "mcq" && (
              <>
                <label className="block text-gray-700 font-medium mb-2">
                  Add Paragraph (Optional):
                </label>
                <Textarea value={q.paragraph} onChange={(e) => handleParagraphChange(qIndex, e.target.value)} rows="3" />
              </>
            )}

            {/* Question Input */}
            <label className="block mt-3">
              {q.type === "paragraph" ? "Paragraph Question:" : "Question:"}
            </label>
            <Input type="text" value={q.question} onChange={(e) => handleQuestionChange(qIndex, e.target.value)} />

            {/* MCQ Choices */}
            {q.type === "mcq" && (
              <>
                <div>
                  <h2>Enable Multiple Answers:</h2>
                  <Switcher
                    isChecked={q.isMultiple || false} // ✅ Use question-specific state
                    setIsChecked={() => {
                      const updatedQuestions = [...questions];
                      updatedQuestions[qIndex].isMultiple = !q.isMultiple;
                      updatedQuestions[qIndex].choices = updatedQuestions[
                        qIndex
                      ].choices.map((choice) => ({
                        ...choice,
                        isCorrect: false, // ✅ Reset all answers
                      }));

                      setQuestions(updatedQuestions);
                    }}
                  />
                  {/* ✅ Use Switcher */}
                  <p>
                    MCQ Type: {isChecked ? "Multiple Answers" : "Single Answer"}
                  </p>
                </div>
                <label className="block text-gray-700 font-medium mt-3">
                  Choices:
                </label>
                {q.choices.map((choice, cIndex) => (
                  <div key={cIndex} className="flex items-center mt-1">
                    <input
                      type={q.isMultiple ? "checkbox" : "radio"}
                      name={`answer-${qIndex}`}
                      checked={choice.isCorrect ?? false} // ✅ Correctly check the selected answer
                      onChange={() => handleChoiceAnswerChange(qIndex, cIndex)} // ✅ Call function to update state
                      className="mr-2"
                    />

                    <input
                      type="text"
                      value={choice.text ?? ""}
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
                  onChange={(e) => handleAnswerChange(qIndex, e.target.value)}
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
          <Button
            onClick={() => addQuestion("paragraph")}
            className="bg-green-600"
          >
            ➕ Add Paragraph Question
          </Button>
        </div>

        {/* Submit Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={handleSubmit}
            className="bg-purple-600 px-6 py-3 text-lg"
          >
            ✅ Submit Assessment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateAssessment;
