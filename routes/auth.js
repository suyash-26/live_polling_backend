const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");
const User = require("../models/User");
const auth = require("../middleware/auth");

router.get("/protected", (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      const error = new Error("No token found");
      error.statusCode = 401;
      error.code = "UNAUTHORIZED";
      throw error;
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      res.json({ msg: "authorized successfully" });
    } catch (error) {
      const err = new Error("Invalid token in cookie");
      err.statusCode = 401;
      err.code = "UNAUTHORIZED";
      next(err);
    }
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res,next) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      const error = new Error("Email and password required");
      error.statusCode = 400;
      error.code = "INVALID_CREDENTIALS";
      throw error;
    }
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      const error = new Error("User does not exists");
      error.statusCode = 400;
      error.code = "INVALID_CREDENTIALS";
      throw error;
    }
    const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token, { httpOnly: true });
    res.json({ msg: "User registered successfully" });
  } catch (err) {
    console.error(err);
    next(err);
    return;
  }
});

router.post("/signup", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      const error = new Error("Email and password required");
      error.statusCode = 400;
      error.code = "INVALID_CREDENTIALS";
      throw error;
    }
    // Demo user; in prod, hash/compare
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    // Save newUser to DB (omitted for brevity)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("User already exists");
      error.statusCode = 400;
      error.code = "INVALID_CREDENTIALS";
      throw error;
    }
    const createdUser = await newUser.save();
    const token = jwt.sign({ id: createdUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token, { httpOnly: true });
    res.json({ msg: "User registered successfully" });
  } catch (err) {
    console.error(err);
    next(err);
    return;
  }
});

// Logout API
router.post("/logout", (req, res, next) => {
  try {
    // Clear the token cookie
    res.clearCookie("token", {
      httpOnly: true,
    });
    res.json({ message: "Logout successful" });
  } catch (err) {
    const error = new Error("Failed to log out");
    error.statusCode = 500;
    next(error);
  }
});

module.exports = router;
