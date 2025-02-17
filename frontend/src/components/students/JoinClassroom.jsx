import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/store/auth-slice";
import { useNavigate } from "react-router-dom";

export default function JoinClassroom() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const {idToken} = useAuthStore();
  const navigate = useNavigate();
  const handleJoinClassroom = async () => {
    if (!code.trim()) {
      toast.error("Please enter a valid classroom code.");
      return;
    }
  
    setLoading(true);
    try {
      const response = await axiosInstance.post(
        "/c/join",
        { code: code },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
  
      // Axios automatically parses JSON, so use response.data
      if (response.status === 200) {
        toast.success("Successfully joined the classroom!");
        setCode("");
        navigate("/student/dashboard/c");
      } else {
        toast.error(response.data.error || "Failed to join the classroom.");
      }
    } catch (error) {
      // Handle both response errors and network errors
      toast.error(error.response?.data?.error || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl font-semibold">
            Join a Classroom
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            placeholder="Enter classroom code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mb-4"
          />
          <Button
            onClick={handleJoinClassroom}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Joining..." : "Join"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
