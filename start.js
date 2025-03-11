const { exec } = require("child_process");
const readline = require("readline");
const os = require("os");

// Get the local network IP
const getLocalNetworkIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost"; // Fallback to localhost
};

const networkIP = getLocalNetworkIP();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("\n🌐 Choose Mode:");
console.log("1️⃣ Localhost (Default)");
console.log("2️⃣ Network (For phone testing)");
rl.question("\nEnter choice (1 or 2): ", (choice) => {
  const useNetwork = choice.trim() === "2";
  const backendURL = useNetwork ? `http://${networkIP}:5001` : "http://localhost:5001";
  const frontendURL = useNetwork ? `http://${networkIP}:5173` : "http://localhost:5173";

  console.log(`\n✅ Using Backend: ${backendURL}`);
  console.log(`✅ Using Frontend: ${frontendURL}`);

  // Set environment variables for frontend
  exec(`echo "VITE_API_URL=${backendURL}" > frontend/.env`, (err) => {
    if (err) console.error("❌ Failed to update frontend .env:", err);

    console.log("🔄 Restarting frontend...");
    exec("cd frontend && npm run dev", (err, stdout, stderr) => {
      if (err) console.error("❌ Frontend Error:", err);
      console.log(stdout);
      console.error(stderr);
    });
  });

  // Start backend server
  console.log("🚀 Starting backend...");
  exec(`cd backend && NODE_ENV=${useNetwork ? "network" : "local"} npm run dev`, (err, stdout, stderr) => {
    if (err) console.error("❌ Backend Error:", err);
    console.log(stdout);
    console.error(stderr);
  });

  rl.close();
});
