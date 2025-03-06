import admin from "../../firebase-config/firebaseAdmin.js";
import User from "../../models/user.model.js";
import cloudinary from "../../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { uid, displayName, email, photoURL } = req.body;
  const idToken = req.headers.authorization?.split(" ")[1];
  try {
    let decodedToken;
    try {
      if (!idToken)
        return res.status(400).json({ message: "no firebase token is passed" });

      decodedToken = await admin.auth().verifyIdToken(idToken);

      if (decodedToken.uid !== uid) {
        return res.status(400).json({ message: "token is wrong" });
      }
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Invalid or expired firebase token" });
    }

    // Check if user already exists in the database
    const user = await User.findOne({ email: decodedToken.email });
    if (user) return res.status(400).json({ message: "Email already exists" });

    // Create a new user
    const newUser = new User({
      fullName: displayName || decodedToken.name  ,
      email: decodedToken.email,
      uid: decodedToken.uid,
      photoURL: photoURL || "",
      
    });

    await newUser.save(); // Save user to database

    // Send a successful response with the user details
    return res.status(200).json({
      _id: newUser._id,
      uid: newUser.uid,
      fullName: newUser.fullName,
      email: newUser.email,
      photoURL: newUser.photoURL,
      
    });
  } catch (error) {
    // Handle unexpected errors
    res
      .status(500)
      .json({ message: `Error in signup controller: ${error.message}` });
    console.log("Error in signup:", error.message);
  }
};

export const login = async (req, res) => {
  // Expect Firebase ID token from the frontend
  try {
    const { uid } = req.body;
    const idToken = req.headers.authorization?.split(" ")[1];

    if (!idToken) {
      return res.status(400).json({ message: "No Firebase token provided" });
    }

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
      if (decodedToken.uid !== uid) {
        return res.status(400).json({ message: "UID does not match token" });
      }
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Invalid or expired Firebase token" });
    }

    // Find the user in the database
    const user = await User.findOne({ uid: decodedToken.uid });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found. Please sign up first." });
    }

    res.status(200).json({
      _id: user._id,
      uid: user.uid,
      fullName: user.fullName,
      email: user.email,
      photoURL: user.photoURL,
      role: user.role,
    });
  } catch (error) {
    console.error("Error in login controller:", error.message);
    res.status(500).json({
      message: "Server error in login controller",
      error: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic)
      return res.status(400).json({ message: "Profilepic is not provided" });

    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkAuth = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in Check Auth controller");
    res.status(500).json({ message: "Server error" });
  }
};

export const updateRole = async (req, res) => {
  const { role } = req.body;
  const userId = req.user._id;

  if (!role) {
    return res.status(400).json({ message: "Role is required" });
  }

  try {
    const user = await User.findByIdAndUpdate(
      userId, // Ensure req.user._id contains the authenticated user's ID
      { role: role }, // Update only the role field
      { new: true } // Return the updated user document
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Role updated successfully", user });
  } catch (error) {
    console.error("Error updating role:", error); // Log error for debugging
    res.status(500).json({ message: "Server error" });
  }
};
