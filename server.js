// require("dotenv").config();
// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const http = require("http");
// const socketIo = require("socket.io");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
// const cookieParser = require('cookie-parser');
// const User = require("./models/User"); // Assume you add a User model for auth

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server, { cors: { origin: "*" } });

// // app.use(cors());
// app.use(cors({
//   origin: "http://localhost:5173",
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true,
// }));
// app.use(express.json());
// app.use(cookieParser());

// // DB Connect
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => console.error("Connection error:", err));

// // Routes
// app.use("/api/polls", require("./routes/polls"));
// app.use('/api/auth', require('./routes/auth')); // Add auth routes below



// // global error handler middleware
// app.use(require("./middleware/errorHandler"))

// require("./socket")(io); // Socket setup

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => console.log(`Server on port ${PORT}`));


//   update code as render can't recognize above syntax 

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const socketIo = require("socket.io");

// Initialize Express
const app = express();

// CORS Configuration
app.use(
  cors({
    origin: "http://localhost:5173", // Change this to your frontend URL in production
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.get("/", (req, res) => {
  res.send("Live Polling Server is running");
})

app.use("/api/polls", require("./routes/polls"));
app.use("/api/auth", require("./routes/auth"));

// Global Error Handler
app.use(require("./middleware/errorHandler"));

// Health Check Route (Optional but recommended)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running!" });
});

// Start Server with app.listen() — REQUIRED FOR RENDER
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

// Attach Socket.IO to the server returned by app.listen()
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Pass `io` to your socket logic
require("./socket")(io);

// Optional: Log when a client connects
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
});