import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/store/auth-slice";
import { Copy, Check } from "lucide-react";
import toast from "react-hot-toast";

const HallTicketPage = () => {
  const { authUser } = useAuthStore();
  const [pin, setPin] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const {idToken} = useAuthStore();
  const handlePinUpdate = async () => {
    setLoading(true);
    try {
      await axiosInstance.put("/assess/change-pin", { newPin: pin },{
        headers: {
          
          Authorization: `Bearer ${idToken}`,
        },
      });
      toast.success("PIN updated successfully");
    } catch {
      alert("Failed to update PIN");
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchScorePilot = () => {
    window.open("scorepilot://", "_self");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(authUser.examuserId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!authUser) return <p>Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-4">ScorePilot</h1>

      <Card className="shadow-xl">
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold">Exam User ID</h2>
              <div className="flex items-center gap-2 mt-2">
                <Input readOnly value={authUser.examuserId} className="w-64 border-none" />
                <Button size="icon" variant="secondary" onClick={handleCopy} className="bg-[#9d14e7] hover:bg-[#69218f] text-white">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </Button>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Secret PIN</h2>
            <div className="flex items-center gap-2">
              <Input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-64"
              />
              <Button onClick={handlePinUpdate} disabled={loading} className="bg-[#9d14e7] ">
                {loading ? "Updating..." : "Change PIN"}
              </Button>
            </div>
          </div>

          
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-2">Exam Instructions</h3>
          <ul className="list-disc pl-5 text-sm text-gray-900 space-y-1">
            <li>Be seated 10 minutes before the exam starts.</li>
            <li>Use the ScorePilot App to attend the exam.</li>
            <li>Do not close or minimize the ScorePilot App during the exam.</li>
            <li>Do not attempt to switch tabs or open other applications.</li>
            <li>PIN is mandatory to authenticate your session in the app.</li>
            <li>Ensure stable internet connection for the entire duration.</li>
          </ul>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button size="lg" onClick={handleLaunchScorePilot} className="bg-[#9d14e7] ">
          🚀 Launch ScorePilot App
        </Button>
      </div>
    </div>
  );
};

export default HallTicketPage;
