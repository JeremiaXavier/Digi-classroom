import { Button } from "@/components/ui/button";

import { useAuthStore } from "@/store/auth-slice";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import samplelogo from "../../assets/edupilot.png";
const AuthLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login, isLogginIn, googleLogin } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);


  const onSubmit = async (e) => {
    e.preventDefault();
    if (await login(formData)) navigate("/");
  };
  const onGoogleLogin = async () => {
    if (await googleLogin()) navigate("/");
  };
  return (
    <div className="flex flex-col h-screen w-full">
      <div className="flex flex-grow">
        {/* Left column */}
        <div className="hidden md:flex flex-1 items-center justify-center bg-white">
          <div className="flex flex-col text-center  items-center text-black-600">
            {/* Placeholder for classroom design */}
            <img src={samplelogo} alt="" className="w-6/12" />
            
          </div>
        </div>

        {/* Right column */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md bg-white p-8 shadow-md rounded-lg">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Login with Google 
              </h1>
              <p className="mt-2">
                Don t have an account
                <Link
                  className="font-medium text-primary hover:underline "
                  to="/signup"
                >
                  Sign Up
                </Link>
              </p>
            </div>
            
            <Button
              variant="outline"
              className="w-full mt-4 flex justify-center items-center"
              onClick={onGoogleLogin}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
              </svg>
              Login with Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLogin;
