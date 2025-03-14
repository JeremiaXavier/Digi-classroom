import Assessment from "../../models/assessment.model.js";
import Member from "../../models/members.models.js";

import Answer from "../../models/answer.model.js";
import Grade from "../../models/grade.model.js";
import { upload } from "../../middlewares/assessment/assessment.middleware.js";
import Category from "../../models/category.model.js";

export const createAssessment = async (req, res) => {
  try {
    const { title, timeLimit, questions } = req.body; // ✅ Include `timeLimit`

    if (!title || !timeLimit) {
      return res.status(400).json({ error: "Title and timeLimit are required." });
    }

    const newAssessment = new Assessment({
      title,
      timeLimit, // ✅ Ensure `timeLimit` is passed
      createdBy: req.user._id,
      questions,
    });

    await newAssessment.save();
    res
      .status(201)
      .json({ message: "Assessment created successfully", newAssessment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getAssessments = async (req, res) => {
  try {
    const assessment = await Assessment.find({ createdBy: req.user._id }).populate("assignedClassrooms", "name");;
    if (assessment.length > 0) {
      res.status(200).json({ message: "successfully fetched", assessment });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudentAssessments = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find classrooms where the user is a student
    const enrolledClasses = await Member.find({
      userId,
      role: "student",
    }).select("classroomId");

    // Extract classroom IDs
    const classroomIds = enrolledClasses.map((member) => member.classroomId);

    // Find assessments assigned to those classrooms
    const assessments = await Assessment.find({
      assignedClassrooms: { $in: classroomIds },
    });

    res.status(200).json({ message: "success", assessments });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching assessments", error: error.message });
  }
};

export const assignAssessment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { assessmentId, classroomIds } = req.body;

    if (!assessmentId || !classroomIds || classroomIds.length === 0) {
      return res
        .status(400)
        .json({
          message:
            "Invalid data. Please provide an assessment ID and at least one classroom ID.",
        });
    }

    // Update the assessment by adding multiple classrooms
    const updatedAssessment = await Assessment.findByIdAndUpdate(
      assessmentId,
      { $addToSet: { assignedClassrooms: { $each: classroomIds } } }, // Prevents duplicate classroom assignments
      { new: true }
    );

    if (!updatedAssessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    res
      .status(200)
      .json({
        message: "Assessment assigned successfully!",
        assessment: updatedAssessment,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getQuestionsForExamination = async (req, res) => {
  try {
    const { id } = req.params;

    const assessment = await Assessment.findById(id).select("title questions");

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    // Process questions to remove answers from paragraph questions
    const filteredQuestions = assessment.questions.map((q) => {
      return {
        _id: q._id,
        type: q.type,
        paragraph: q.paragraph, // Keep the paragraph if it exists
        question: q.question,
        choices: q.type === "mcq" ? q.choices : undefined, // Include choices for MCQs
        isMultiple: q.isMultiple, // Include if it's a multiple-answer MCQ
      };
    });

    res.status(200).json({
      assessmentId: assessment._id,
      assessmentTitle: assessment.title,
      questions: filteredQuestions,
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const EvaluateAnswers = async (req, res) => {
  try {
    const { testId, userId } = req.body;

    // 🔹 Check if the assessment exists
    const assessment = await Assessment.findById(testId);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found!" });
    }

    // 🔹 Fetch student's answers from Answer collection
    const answerDoc = await Answer.findOne({ testId, userId });
    if (!answerDoc) {
      return res.status(404).json({ message: "Student's answers not found!" });
    }

    // 🔹 Prevent duplicate grading
    const existingGrade = await Grade.findOne({ testId, userId });
    if (existingGrade) {
      return res.status(400).json({ message: "Exam already graded!" });
    }

    let mcqScore = 0; // Stores MCQ score

    // 🔹 Auto-grade MCQs
    assessment.questions.forEach((question) => {
      if (question.type !== "mcq") return; // Ignore paragraph questions

      const userAnswer = answerDoc.answers.find(
        (ans) => String(ans.questionId) === String(question._id)
      );
      if (!userAnswer) return; // Skip if no answer provided

      const correctChoices = new Set(
        question.choices.filter((c) => c.isCorrect).map((c) => String(c._id))
      ); // Set of correct answer IDs

      const userChoices = new Set(userAnswer.answerId.map((id) => String(id))); // Set of user-selected answer IDs

      let marks = 0;
      if (question.isMultiple) {
        const correctCount = [...userChoices].filter((id) => correctChoices.has(id)).length;
        marks = correctCount; // 1 mark per correct answer selected
      } else {
        marks = correctChoices.has([...userChoices][0]) ? 1 : 0; // Single-choice MCQ = 1 mark if correct
      }

      mcqScore += marks;
    });

    // 🔹 Store MCQ score in Grade collection
    const grade = new Grade({
      testId,
      userId,
      mcqScore,
      status: "pending", // Manual grading required for paragraph questions
    });

    await grade.save();

    return res.status(200).json({ message: "MCQ Auto-Grading Completed!", mcqScore });
  } catch (error) {
    console.error("Error grading exam:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const getStudentAnswers = async (req, res) => {
  try {
    const { testId, userId } = req.params;

    const answerRecord = await Answer.findOne({ testId, userId });

    if (!answerRecord) {
      return res.status(200).json({ answers: [] }); // No answers yet
    }

    res.status(200).json({ answers: answerRecord.answers });
  } catch (error) {
    res.status(500).json({ message: "Error fetching answers", error });
  }
};

// ✅ Save or update a student's answer
export const saveStudentAnswer = async (req, res) => {
  try {
    const {
      testId,
      userId,
      questionId,
      isMultiple,
      answerId,
      paragraphAnswer,
      type,
    } = req.body;

    if (!testId || !userId || !questionId || !type) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let answerRecord = await Answer.findOne({ testId, userId });

    if (!answerRecord) {
      answerRecord = new Answer({ testId, userId, answers: [] });
    }

    // Check if the question already has an answer
    const existingAnswerIndex = answerRecord.answers.findIndex(
      (a) => a.questionId.toString() === questionId
    );

    if (existingAnswerIndex !== -1) {
      // Update existing answer based on type
      if (type === "mcq") {
        answerRecord.answers[existingAnswerIndex] = {
          questionId,
          isMultiple,
          answerId: isMultiple
            ? [
                ...new Set([
                  ...answerRecord.answers[existingAnswerIndex].answerId,
                  ...answerId,
                ]),
              ]
            : answerId,
          paragraphAnswer: "", // Ensure no paragraphAnswer for MCQs
        };
      } else if (type === "paragraph") {
        answerRecord.answers[existingAnswerIndex] = {
          questionId,
          isMultiple: false,
          answerId: [], // Ensure no answerId for paragraphs
          paragraphAnswer,
        };
      }
    } else {
      // Add new answer based on type
      const newAnswer = {
        questionId,
        isMultiple: type === "mcq",
        paragraphAnswer: type === "paragraph" ? paragraphAnswer : "",
      };
      if (type === "mcq") newAnswer.answerId = answerId;
      if (type === "paragraph") newAnswer.answerId = []; // Ensure empty answerId for paragraphs

      answerRecord.answers.push(newAnswer);
    }

    await answerRecord.save();

    res
      .status(200)
      .json({
        message: "Answer saved successfully",
        answers: answerRecord.answers,
      });
  } catch (error) {
    console.error("Error saving answer:", error);
    res
      .status(500)
      .json({ message: "Error saving answer", error: error.message });
  }
};

export const getStudentsAttended = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const submittedGrades = await Grade.find({ testId: assessmentId }).populate(
      "userId testId"
    );

    const students = submittedGrades.map((grade) => ({
      userId: grade.userId._id,
      name: grade.userId.fullName,
      email: grade.userId.email,
      profile: grade.userId.photoURL,
      totalMarks: grade.totalMarks,
      maxMarks: grade.testId.questions.reduce(
        (sum, q) => (q.type === "mcq" ? sum + q.marks : sum),
        0
      ),
    }));

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Error fetching students" });
  }
};

export const getStudentAnswersReview = async (req, res) => {
  try {
    const { userId, testId } = req.params;
    const submission = await Answer.findOne({ userId, testId }).populate(
      "testId"
    );
    if (!submission)
      return res.status(404).json({ message: "Submission not found" });

    const paragraphAnswers = submission.answers
      .filter((ans) => ans.paragraphAnswer)
      .map((ans) => ({
        questionId: ans.questionId,
        question: submission.testId.questions.find(
          (q) => q._id.toString() === ans.questionId.toString()
        )?.question,
        paragraphAnswer: ans.paragraphAnswer,
        marks:
          submission.testId.questions.find(
            (q) => q._id.toString() === ans.questionId.toString()
          )?.marks || 0,
      }));

    res.json({ answers: paragraphAnswers });
  } catch (error) {
    res.status(500).json({ message: "Error fetching answers" });
  }
};

export const updateGrade = async (req, res) => {
  try {
    const { testId, userId, answers } = req.body;

    // 🔹 Find the student's answer document
    const answerDoc = await Answer.findOne({ testId, userId });
    if (!answerDoc) {
      return res.status(404).json({ message: "Student's answers not found!" });
    }

    // 🔹 Update marks for each paragraph question
    answers.forEach(({ questionId, marks }) => {
      const answer = answerDoc.answers.find((ans) =>
        ans.questionId.equals(questionId)
      );
      if (answer) answer.marks = marks;
    });

    await answerDoc.save();

    // 🔹 Calculate the total manual score
    const manualScore = answerDoc.answers.reduce(
      (sum, ans) => sum + (ans.marks || 0),
      0
    );

    // 🔹 Find the grade document
    const gradeDoc = await Grade.findOne({ testId, userId });
    if (!gradeDoc) {
      return res.status(404).json({ message: "Grade record not found!" });
    }

    // 🔹 Update manualScore and totalScore
    gradeDoc.manualScore = manualScore;
    gradeDoc.totalScore = gradeDoc.mcqScore + manualScore; // Sum MCQ and manual scores
    gradeDoc.status = "graded"; // Mark as graded

    await gradeDoc.save();

    res
      .status(200)
      .json({
        message: "Grades updated successfully!",
        manualScore,
        totalScore: gradeDoc.totalScore,
      });
  } catch (error) {
    console.error("Error updating grades:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    // Check if the assessment exists
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    // Delete related answers
    await Answer.deleteMany({ testId:assessmentId });

    // Delete related grades
    await Grade.deleteMany({ testId:assessmentId });

    // Delete the assessment itself
    await Assessment.findByIdAndDelete(assessmentId);

    res.status(200).json({ message: "Assessment deleted successfully" });
  } catch (error) {
    console.error("Error deleting assessment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const removeClassroomFromAssessment = async (req, res) => {
  try {
    const { assessmentId, classroomId } = req.params;

    // Remove the classroom ID from the assignedClassrooms array in the assessment
    await Assessment.findByIdAndUpdate(assessmentId, {
      $pull: { assignedClassrooms: classroomId },
    });

    res.status(200).json({ message: "Classroom removed from assessment successfully." });
  } catch (error) {
    console.error("Error removing classroom from assessment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const uploadAssessmentImage = async (req, res) => {
  try {
    // Use multer upload middleware
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: "File upload failed", error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Get uploaded file info (Only one file, since it's an image upload)
      const uploadedFile = {
        filename: req.file.filename,
        imageUrl: `http://192.168.200.199:5001/uploads/assignment/${req.file.filename}`, // Corrected URL
      };

      res.status(200).json({ message: "Image uploaded successfully", imageUrl: uploadedFile.imageUrl });
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;

    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = new Category({ name });
    await category.save();
    res.status(201).json({ message: "Category added successfully", category });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};