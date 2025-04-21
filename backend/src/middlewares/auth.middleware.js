import admin from "../firebase-config/firebaseAdmin.js";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  const idToken = req.headers.authorization?.split(" ")[1]; // Extract Firebase token
  const examuserId = req.headers["x-exam-user-id"]; // Extract examuserId (for Electron)

  try {
    let user = null;

    if (idToken) {
      // ✅ If `idToken` exists, verify it
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      if (!decodedToken) {
        return res.status(401).json({ message: "Unauthorized -- Invalid Token" });
      }

      // Find user using Firebase UID
      user = await User.findOne({ uid: decodedToken.uid });
    } else if (examuserId) {
      // ✅ If `idToken` is missing, use `uid` authentication (for Electron)
      user = await User.findOne({ examuserId });
    } else {
      return res.status(400).json({ message: "No authentication method provided. Please login." });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in protectRoute:", error.message);
    if (error.code === "auth/id-token-expired") {
      return res.status(401).json({ message: "Token has expired" });
    }
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};



export const scorepilotAuth = async (req, res, next) => {
  const idToken = req.headers.authorization?.split(" ")[1]; // Extract Firebase token
  const examuserId = req.headers["x-exam-user-id"]; // Extract examuserId (for Electron)
  const pin = req.headers["x-otp"];
  try {
    let user = null;

    if (idToken) {
      // ✅ If `idToken` exists, verify it
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      if (!decodedToken) {
        return res.status(401).json({ message: "Unauthorized -- Invalid Token" });
      }

      // Find user using Firebase UID
      user = await User.findOne({ uid: decodedToken.uid });
    } else if (examuserId) {
      // ✅ If `idToken` is missing, use `examuserId` for authentication (for Electron)
      user = await User.findOne({ examuserId,otp:pin });
    } else {
      return res.status(400).json({ message: "No authentication method provided. Please login." });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in authenticateUser middleware:", error.message);
    if (error.code === "auth/id-token-expired") {
      return res.status(401).json({ message: "Token has expired" });
    }
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

/*  try {
    const token = req.cookies.jwt;
    if (!token)
      return res
        .status(400)
        .json({ message: "Unauthorized -no token in provided" });
    console.log("protectRoute no token ");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized--Invalid Token" });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      res.status(404).json({ message: "user not found" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log("Error in protectedRoute", error.message);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }*/
