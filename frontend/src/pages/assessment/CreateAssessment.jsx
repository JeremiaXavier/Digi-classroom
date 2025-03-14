import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/store/auth-slice";
import toast from "react-hot-toast";
import Switcher from "@/components/assessment/Switcher";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CreateAssessment = () => {
  const [isChecked, setIsChecked] = useState(false);
  const [timeLimit, setTimeLimit] = useState(30);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);

  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState([
    {
      type: "mcq",
      paragraph: "",
      question: "",
      choices: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
      answer: "",
      isMultiple: false,
      category: "",
      imageUrl: "", // ✅ Store uploaded image URL
    },
  ]);
  const { idToken } = useAuthStore();
  const [title, setTitle] = useState("");
  // Add a new question
  const addQuestion = (type) => {
    setQuestions([
      ...questions,
      type === "paragraph"
        ? {
            type: "paragraph",
            paragraph: "",
            question: "",
            answer: "",
            category: "",
            imageUrl: "",
          }
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
            category: "",
            imageUrl: "",
          },
    ]);
  };

  const handleImageUpload = async (e, qIndex) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file); // 🔹 Must match multer field name in backend

    try {
      const response = await axiosInstance.post(
        "/assess/upload/image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      const updatedQuestions = [...questions];
      updatedQuestions[qIndex].imageUrl = response.data.imageUrl; // 🔹 Matches fixed backend response
      setQuestions(updatedQuestions);

      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload image.");
    }
  };
  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get(`/assess/get-category`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      setCategories(response.data);
    } catch (error) {
      toast.error("Failed to load categories");
    }
  };
  useEffect(() => {
    fetchCategories();
  }, [idToken]);
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
    setQuestions((prevQuestions) => {
      return prevQuestions.map((question, index) => {
        if (index !== qIndex) return question; // Keep other questions unchanged

        let updatedChoices = question.choices.map((choice, i) => {
          if (question.isMultiple) {
            // ✅ Toggle isCorrect for multiple-choice questions
            return i === cIndex
              ? { ...choice, isCorrect: !choice.isCorrect }
              : choice;
          } else {
            // ✅ Only one answer should be correct (radio behavior)
            return { ...choice, isCorrect: i === cIndex };
          }
        });

        return { ...question, choices: updatedChoices };
      });
    });
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
  // Handle category change

  const handleCategoryChange = (qIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].category = value;
    setQuestions(updatedQuestions);
  };
  const handleAddNewCategory = async () => {
    if (!newCategory.trim()) {
      toast.error("Category name cannot be empty!");
      return;
    }

    try {
      const response = await axiosInstance.post(
        "/assess/add-category",
        { name: newCategory },
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      const addedCategory = response.data; // Expecting `{ _id, name }`

      setCategories((prev) => [...prev, addedCategory]);
      if (selectedQuestionIndex !== null ) {
        handleCategoryChange(selectedQuestionIndex, addedCategory._id);
      }
      fetchCategories();
      setShowNewCategoryInput(false);
      setNewCategory("");
      setSelectedQuestionIndex("");
      toast.success("Category added successfully!");
    } catch (error) {
      toast.error("Failed to add category.");
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const response = await axiosInstance.post(
        "/assess/create",
        { title, timeLimit, questions },
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
          <label className="block text-xl font-semibold mb-2">
            Assessment Title
          </label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter assessment name"
          />
          {/* Time Limit */}
          <label className="block mt-4 text-xl font-semibold">
            Time Limit (Minutes)
          </label>
          <Input
            type="number"
            value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
            min="1"
          />

          {questions.map((q, qIndex) => (
            <div
              key={qIndex}
              className="mt-6 p-4 border rounded-lg bg-gray-100"
            >
              {/* Question Number */}
              <h2 className="text-lg font-semibold mb-2">
                Question {qIndex + 1}
              </h2>
              {/* Category Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>

                {showNewCategoryInput ? (
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Enter new category name"
                    />
                    <Button
                      onClick={handleAddNewCategory}
                      className="bg-blue-600"
                    >
                      Add
                    </Button>
                    <Button
                      onClick={() => setShowNewCategoryInput(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Select
                    value={q.category} // ✅ Each question maintains its own category
                    onValueChange={(value) => {
                      if (value === "add-new") {
                        setSelectedQuestionIndex(qIndex); 
                        setShowNewCategoryInput(true);
                      } else {
                        handleCategoryChange(qIndex, value); // ✅ Update only the specific question
                      }
                    }}
                  >
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue placeholder="Select or search a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="add-new" className="text-blue-500">
                        ➕ Add New Category
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Optional Paragraph Input */}
              {q.type === "mcq" && (
                <>
                  <label className="block text-gray-700 font-medium mb-2">
                    Add Paragraph (Optional):
                  </label>
                  <Textarea
                    value={q.paragraph}
                    onChange={(e) =>
                      handleParagraphChange(qIndex, e.target.value)
                    }
                    rows="3"
                  />
                </>
              )}

              {/* Question Input */}
              <label className="block mt-3">
                {q.type === "paragraph" ? "Paragraph Question:" : "Question:"}
              </label>
              <Input
                type="text"
                value={q.question}
                onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
              />

              {/* MCQ Choices */}
              {q.type === "mcq" && (
                <>
                  <div className="flex items-center mt-3">
                    <p className="mr-2">Multiple Answers</p>
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
                  </div>
                  <label className="block mt-3">Choices</label>
                  {q.choices.map((choice, cIndex) => (
                    <div key={cIndex} className="flex items-center mt-2 gap-2">
                      <input
                        type={q.isMultiple ? "checkbox" : "radio"}
                        name={`answer-${qIndex}`}
                        checked={choice.isCorrect ?? false} // ✅ Correctly check the selected answer
                        onChange={() =>
                          handleChoiceAnswerChange(qIndex, cIndex)
                        } // ✅ Call function to update state
                        className="mr-1"
                      />

                      <Input
                        type="text"
                        value={choice.text ?? ""}
                        onChange={(e) =>
                          handleChoiceChange(qIndex, cIndex, e.target.value)
                        }
                        placeholder={`Choice ${cIndex + 1}`}
                      />
                    </div>
                  ))}
                  <Button
                    onClick={() => addChoice(qIndex)}
                    className="mt-2 text-blue-600 bg-white text-sm"
                  >
                    ➕ Add Choice
                  </Button>
                </>
              )}

              {/* Paragraph-Based Answer Input */}
              {q.type === "paragraph" && (
                <>
                  <label className="block text-gray-700 font-medium mt-3">
                    Answer:
                  </label>
                  <Textarea
                    className="w-full p-2 border rounded mt-1"
                    rows="4"
                    placeholder="Enter answer"
                    onChange={(e) => handleAnswerChange(qIndex, e.target.value)}
                  />
                </>
              )}
              <button
                onClick={() =>
                  document.getElementById(`imageUpload-${qIndex}`).click()
                }
                className="mt-2 mx-2 text-blue-600 text-sm"
              >
                ➕ Add Image
              </button>

              {/* Hidden File Input */}
              <input
                type="file"
                id={`imageUpload-${qIndex}`}
                accept="image/*"
                onChange={(e) => handleImageUpload(e, qIndex)}
                className="hidden"
              />
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
          <div className="mt-6 text-center">
            <Button
              onClick={handleSubmit}
              className="bg-purple-600 px-6 py-3 text-lg"
            >
              ✅ Submit Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateAssessment;
