require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cookieParser = require('cookie-parser');
const User = require("./models/User"); // Assume you add a User model for auth

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

// app.use(cors());
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// DB Connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Connection error:", err));

// Routes
app.use("/api/polls", require("./routes/polls"));
app.use('/api/auth', require('./routes/auth')); // Add auth routes below



// global error handler middleware
app.use(require("./middleware/errorHandler"))

require("./socket")(io); // Socket setup

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server on port ${PORT}`));
