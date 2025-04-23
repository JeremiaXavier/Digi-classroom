import React from "react";
import welcomeImage from "@/assets/examination.jpg"; // Adjust the path to your image

const LandingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-800">
      {/* Image Section */}
      

      {/* Text Content */}
      <h1 className="text-4xl font-bold mb-4 font-serif">
        Welcome to Scorepilot Web
      </h1>
      <p className="text-lg text-gray-600">
        Select an option from the sidebar to get started.
      </p>
    </div>
  );
};

export default LandingPage;
