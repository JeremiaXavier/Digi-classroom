import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-slice";
import { axiosInstance } from "@/lib/axios";

const EvaluateStudent = () => {
  const { userId, testId } = useParams();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
    const {idToken} = useAuthStore();
  useEffect(() => {
    const fetchStudentAnswers = async () => {
      try {
        const { data } = await axiosInstance.get(`/assess/student/${userId}/${testId}`,{
            headers: { Authorization: `Bearer ${idToken}` },
          });
        setAnswers(data.answers);
      } catch (error) {
        console.error("Error fetching student answers:", error);
      }
    };

    fetchStudentAnswers();
  }, [userId, testId]);

  const handleGradeChange = (questionId, marks) => {
    setAnswers((prevAnswers) =>
      prevAnswers.map((ans) =>
        ans.questionId === questionId ? { ...ans, marks: Number(marks) } : ans
      )
    );
  };

  const handleSubmitGrades = async () => {
    setLoading(true);
    try {
      await axiosInstance.post(
        "/assess/update",
        { userId, testId, answers }, // Correct payload
        { headers: { Authorization: `Bearer ${idToken}` } } // Correct headers placement
      );
      toast.success("Grade updated Successfully");
      navigate("/assessment/evaluate");
    } catch (error) {
      console.error("Error submitting grades:", error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Evaluate Answers</h1>
      {answers.map((answer) => (
        <Card key={answer.questionId} className="mb-4">
          <CardHeader>
            <h2 className="text-lg font-semibold">{answer.question}</h2>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 mb-2">Student Answer:</p>
            <p className="bg-gray-100 p-3 rounded">{answer.paragraphAnswer}</p>

            <div className="mt-4">
              <label className="text-sm font-medium">Marks:</label>
              <Input
                type="number"
                min="0"
                value={answer.marks || ""}
                onChange={(e) => handleGradeChange(answer.questionId, e.target.value)}
                className="w-24 mt-2"
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <Button onClick={handleSubmitGrades} disabled={loading} className="mt-4">
        {loading ? "Submitting..." : "Submit Grades"}
      </Button>
    </div>
  );
};

export default EvaluateStudent;
