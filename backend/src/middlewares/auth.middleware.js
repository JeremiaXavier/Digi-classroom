import admin from "../firebase-config/firebaseAdmin.js";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  const idToken = req.headers.authorization?.split(" ")[1];  // Extract token from Authorization header

  try {
    if (!idToken) {
      return res.status(400).json({ message: "No token provided. Please login to access this resource." });
    }

    // Verify the token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    if (!decodedToken) {
      return res.status(401).json({ message: "Unauthorized--Invalid Token" });
    }

    // Fetch the user from the database using UID from decodedToken
    const user = await User.findOne({ uid: decodedToken.uid });

    if (!user) {
      return res.status(404).json({ message: "User not found for this token" });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error("Error in protectedRoute:", error.message);
    if (error.code === 'auth/id-token-expired') {
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
