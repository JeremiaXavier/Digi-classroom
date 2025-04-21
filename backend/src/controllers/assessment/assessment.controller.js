import Assessment from "../../models/assessment.model.js";
import Member from "../../models/members.models.js";

import Answer from "../../models/answer.model.js";
import Grade from "../../models/grade.model.js";
import { upload } from "../../middlewares/assessment/assessment.middleware.js";
import Category from "../../models/category.model.js";
import { MalpracticeLog } from "../../models/malpracticelog.model.js";
import User from "../../models/user.model.js";
import mongoose from "mongoose";

export const createAssessment = async (req, res) => {
  try {
    const { title, timeLimit, questions } = req.body; // ✅ Include `timeLimit`

    if (!title || !timeLimit) {
      return res
        .status(400)
        .json({ error: "Title and timeLimit are required." });
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
    const assessment = await Assessment.find({
      createdBy: req.user._id,
    }).populate("assignedClassrooms", "name");
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

    // Check if the student has already answered each assessment
    const assessmentsWithStatus = await Promise.all(
      assessments.map(async (assessment) => {
        const answered = await Answer.exists({
          userId,
          testId: assessment._id,
        });

        return {
          ...assessment.toObject(),
          answerSubmitted: answered ? true : false, // Add answered field
        };
      })
    );

    res
      .status(200)
      .json({ message: "success", assessments: assessmentsWithStatus });
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
      return res.status(400).json({
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

    res.status(200).json({
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

    const assessment = await Assessment.findById(id)
      .select("title questions timeLimit")
      .populate({
        path: "questions",
        populate: { path: "category", select: "name" }, // Populate category details
      });

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    // Initialize an object to hold questions grouped by category
    const groupedQuestions = {};

    // Process questions and group them by category
    assessment.questions.forEach((q) => {
      const categoryName = q.category ? q.category.name : "Uncategorized"; // Default to 'Uncategorized' if no category

      // Initialize category if it doesn't exist in the groupedQuestions object
      if (!groupedQuestions[categoryName]) {
        groupedQuestions[categoryName] = [];
      }

      // Add the question to the respective category
      groupedQuestions[categoryName].push({
        _id: q._id,
        type: q.type,
        imageUrl: q.imageUrl,
        paragraph: q.paragraph, // Keep the paragraph if it exists
        question: q.question,
        choices: q.type === "mcq" ? q.choices : undefined, // Include choices for MCQs
        isMultiple: q.isMultiple,
        category: {
          _id: q.category ? q.category._id : null,
          name: categoryName,
        }, // Include category details
      });
    });

    // Convert groupedQuestions into an array to be returned in the response
    const questionsByCategory = Object.keys(groupedQuestions).map(
      (categoryName) => ({
        categoryName,
        questions: groupedQuestions[categoryName],
      })
    );

    res.status(200).json({
      assessmentId: assessment._id,
      assessmentTitle: assessment.title,
      timeLimit: assessment.timeLimit,
      questions: questionsByCategory, // Return the questions grouped by category
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
    let correctAnswers = 0; // ✅ Correct Answers
    let incorrectAnswers = 0; // ❌ Incorrect Answers
    let totalMcqQuestions = 0;
    // 🔹 Auto-grade MCQs
    assessment.questions.forEach((question) => {
      if (question.type !== "mcq") return; // Ignore paragraph questions
      totalMcqQuestions++;
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
        const correctCount = [...userChoices].filter((id) =>
          correctChoices.has(id)
        );
        marks = correctCount.length;
        correctAnswers += correctCount.length;
        incorrectAnswers += userChoices.size - correctCount.length; // 1 mark per correct answer selected
      } else {
        if (correctChoices.has([...userChoices][0])) {
          marks = 1;
          correctAnswers++;
        } else {
          marks = 0;
          incorrectAnswers++;
        } // Single-choice MCQ = 1 mark if correct
      }

      mcqScore += marks;
    });

    // 🔹 Store MCQ score in Grade collection
    const grade = new Grade({
      testId,
      userId,
      mcqScore,
      correctAnswers,
      incorrectAnswers,
      totalMcqQuestions,
      status: "pending", // Manual grading required for paragraph questions
    });

    await grade.save();

    return res.status(200).json({
      message: "MCQ Auto-Grading Completed!",
      mcqScore,
      correctAnswers,
      incorrectAnswers,
      totalMcqQuestions,
    });
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
            ?  [...new Set(answerId)] 
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

    res.status(200).json({
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

    // Fetch user's submission
    const submission = await Answer.findOne({ userId, testId }).populate({
      path: "testId",
      populate: { path: "questions", model: "Assessment" }, // Populate questions
    });

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const allAnswers = submission.testId.questions.map((question) => {
      // Find the user's answer for this question
      const userAnswer = submission.answers.find(
        (ans) => ans.questionId.toString() === question._id.toString()
      );

      // Extract the user-selected choices' text by matching answerId with choices
      const selectedChoiceTexts = userAnswer
        ? question.choices
            .filter((choice) =>
              userAnswer.answerId.some(
                (selectedId) => selectedId.toString() === choice._id.toString()
              )
            )
            .map((choice) => choice.text)
        : [];

      return {
        questionId: question._id,
        question: question.question,
        type: question.type,
        choices: question.choices || [], // All choices for MCQ
        userSelectedChoices: selectedChoiceTexts, // Extracted text of selected choices
        paragraphAnswer: userAnswer ? userAnswer.paragraphAnswer || "" : "",
        marks: question.marks || 0,
      };
    });

    res.json({ answers: allAnswers });
  } catch (error) {
    console.error("Error fetching answers:", error);
    res.status(500).json({ message: "Error fetching answers" });
  }
};

export const updateGrade = async (req, res) => {
  try {
    const { testId, userId, answers } = req.body;

    // 🔹 Find the student's answer document and populate test details
    const answerDoc = await Answer.findOne({ testId, userId }).populate({
      path: "testId",
      populate: { path: "questions" }, // Populate questions to access their types
    });

    if (!answerDoc) {
      return res.status(404).json({ message: "Student's answers not found!" });
    }

    // 🔹 Ensure we only update marks for paragraph questions
    answers.forEach(({ questionId, marks }) => {
      const answer = answerDoc.answers.find((ans) =>
        ans.questionId.equals(questionId)
      );

      const question = answerDoc.testId.questions.find((q) =>
        q._id.equals(questionId)
      );

      // ✅ Only update marks for paragraph questions (ignore MCQs)
      if (answer && question?.type === "paragraph") {
        answer.marks = marks;
      }
    });

    await answerDoc.save();

    // 🔹 Calculate total manual score (only from paragraph answers)
    const manualScore = answerDoc.answers
      .filter((ans) =>
        answerDoc.testId.questions.some(
          (q) => q._id.equals(ans.questionId) && q.type === "paragraph"
        )
      )
      .reduce((sum, ans) => sum + (ans.marks || 0), 0);

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

    res.status(200).json({
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
    await Answer.deleteMany({ testId: assessmentId });

    // Delete related grades
    await Grade.deleteMany({ testId: assessmentId });

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

    res
      .status(200)
      .json({ message: "Classroom removed from assessment successfully." });
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
        return res
          .status(400)
          .json({ message: "File upload failed", error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Get uploaded file info (Only one file, since it's an image upload)
      const uploadedFile = {
        filename: req.file.filename,
        imageUrl: `http://localhost:5001/uploads/assessment/${req.file.filename}`, // Corrected URL
      };

      res.status(200).json({
        message: "Image uploaded successfully",
        imageUrl: uploadedFile.imageUrl,
      });
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

export const getGradesByAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params; // Get assessmentId from URL params
    const grades = await Grade.find({ testId: assessmentId })
      .populate("userId", "fullName") // Populate user details
      .populate("testId", "title") // Populate assessment title
      .exec();

    if (!grades.length) {
      return res
        .status(404)
        .json({ message: "No grades found for this assessment" });
    }

    res.status(200).json(grades);
  } catch (error) {
    console.error("Error fetching grades:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getGradesByUser = async (req, res) => {
  try {
    const { userId } = req.params; // Get userId from URL params
    const grades = await Grade.find({ userId: userId })
      .populate("testId", "title") // Populate assessment title
      .exec();

    if (!grades.length) {
      return res.status(404).json({ message: "No grades found for this user" });
    }

    res.status(200).json(grades);
  } catch (error) {
    console.error("Error fetching grades for user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getStudentScoreboard = async (req, res) => {
  try {
    const { userId } = req.params;

    // 🔹 Fetch all graded assessments for the student
    const grades = await Grade.find({ userId }).populate(
      "testId",
      "title createdAt"
    );

    if (!grades.length) {
      return res.status(404).json({ message: "No exam records found!" });
    }

    // 🔹 Format data for the scoreboard
    const scoreboard = grades.map((grade) => ({
      examTitle: grade.testId.title,
      examDate: grade.testId.createdAt,
      mcqScore: grade.mcqScore,
      manualScore: grade.manualScore,
      totalScore: grade.totalScore,
      correctAnswers: grade.correctAnswers,
      incorrectAnswers: grade.incorrectAnswers,
      totalMcqQuestions: grade.totalMcqQuestions,
      status: grade.status, // pending / graded
    }));

    return res.status(200).json(scoreboard);
  } catch (error) {
    console.error("Error fetching scoreboard:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
 const SUSPENSION_THRESHOLD =3;
export const setMalpracticeLog = async (req, res) => {
  try {
    const { userId, testId, violationType, details = "" } = req.body;

    // Count previous violations for the user in the same exam
    const violationCount = await MalpracticeLog.countDocuments({
      userId,
      testId,
    });

    // Determine if the user should be suspended
    const isSuspended = violationCount + 1 >= SUSPENSION_THRESHOLD;

    // Save malpractice log
    const log = new MalpracticeLog({
      userId,
      testId,
      violationType,
      details,
      isSuspended,
    });
    await log.save();

    // If suspension limit reached, update user status
    if (isSuspended) {
      await User.findByIdAndUpdate(userId, { isSuspended: true });
    }

    res
      .status(201)
      .json({ message: "Malpractice recorded successfully", isSuspended });
  } catch (error) {
    res.status(500).json({ error: "Failed to log malpractice",error:error.message });
  }
};

export const getMalpracticeLog = async (req, res) => {
  try {
    const logs = await MalpracticeLog.find({
      testId: req.params.examId,
    }).populate("userId", "name email isSuspended");
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch malpractice logs" });
  }
};

export const malpracticeAction = async (req, res) => {
  try {
    const { userId, testId } = req.params;

    if (!userId || !testId) {
      return res.status(400).json({ error: "Missing userId or testId" });
    }

    // Delete answers and grades
    await Answer.deleteMany({ userId, testId });
    await Grade.deleteMany({ userId, testId });

    // Update user as suspended
    await User.findByIdAndUpdate(userId, { isSuspended: true });

    // Update all malpractice logs for this user & test
    await MalpracticeLog.updateMany(
      { userId, testId },
      { $set: { actionTaken: "Answer Reset" } }
    );

    return res.status(200).json({ message: "User suspended, answers reset, and malpractice logs updated" });
  } catch (error) {
    console.error("Error handling malpractice:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


export const studentExitExam = async (req, res) => {
  try {
    const { timeleft,testId } = req.body;

    // Log the malpractice event (exiting before the exam ended)
    const malpracticeEntry = new MalpracticeLog({
      userId: req.user._id, 
      testId: testId, // The ID of the test being taken
      violationType: "Exit before exam time ended", // Descriptive violation type
      timestamp: new Date(),
      details: `Student exited before completing the exam. Time left: ${timeleft}`,
      isSuspended: false, // Adjust based on your logic for suspension
      actionTaken: "no action taken", // Change if you apply any actions like resetting answers
    });

    // Save the malpractice entry to the database
    await malpracticeEntry.save();

    // Respond with success message
    return res.status(200).json({ success: true, message: "Malpractice logged successfully" });
  } catch (error) {
    console.error("Error logging malpractice:", error);
    return res.status(500).json({ success: false, message: "An error occurred while logging malpractice" });
  }
};

export const getMalpracticeLogsForAssessment = async (req, res) => {
  const { assessmentId } = req.params; // Get the assessment ID from the request params

  if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
    return res.status(400).json({ message: "Invalid assessment ID" });
  }

  try {
    // Fetch the malpractice logs for the specific assessment
    const malpracticeLogs = await MalpracticeLog.find({ testId: assessmentId })
      .populate({
        path: "userId", // Populate the userId field to get user details
        select: "fullName email photoURL isSuspended", // Select the fields we need from the User model
      })
      .sort({ timestamp: -1 }); // Sort by timestamp to get most recent logs first

    if (!malpracticeLogs.length) {
      return res.status(404).json({ message: "No malpractice logs found for this assessment" });
    }

    // Respond with the logs and associated user details
    return res.status(200).json(malpracticeLogs);
  } catch (error) {
    console.error("Error fetching malpractice logs:", error);
    return res.status(500).json({ message: "Server error while fetching malpractice logs" });
  }
};

export const suspendStudent = async (req, res) => {
  const { logId } = req.params; // Log ID from URL
  try {
    // Find the malpractice log by logId
    const log = await MalpracticeLog.findById(logId);
    
    if (!log) {
      return res.status(404).json({ message: 'Malpractice log not found' });
    }

    // Find the student associated with this log (assuming userId is the student reference)
    const student = await User.findById(log.userId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update student's status to suspended (add a suspended field to your student schema if needed)
    student.isSuspended = true;
    await student.save();

    // Optionally, update the malpractice log to reflect the action taken
    
    log.actionTaken = 'Suspended from all examinations';
    await log.save();

    return res.status(200).json({ message: 'Student suspended successfully' });
  } catch (error) {
    console.error('Error suspending student:', error);
    return res.status(500).json({ message: 'Server error',error:error.message });
  }
};

// Assuming you're using something like MongoDB with Mongoose


export const removeSuspension = async (req, res) => {
  const { logId } = req.params; // Log ID from URL
  try {
    // Find the malpractice log by logId
    const log = await MalpracticeLog.findById(logId);
    
    if (!log) {
      return res.status(404).json({ message: 'Malpractice log not found' });
    }

    // Find the student associated with this log (assuming userId is the student reference)
    const student = await User.findById(log.userId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update student's suspension status to false (remove suspension)
    student.isSuspended = false;
    await student.save();

    // Optionally, update the malpractice log to reflect the action taken
 

    // Remove all malpractice logs for the student
    await MalpracticeLog.deleteMany({ userId: student._id,testId:log.testId });

    return res.status(200).json({ message: 'Suspension removed and all malpractice logs cleared successfully' });
  } catch (error) {
    console.error('Error removing suspension and clearing logs:', error);
    return res.status(500).json({ message: 'Server error',error:error.message });
  }
};