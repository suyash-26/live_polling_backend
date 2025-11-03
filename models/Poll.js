// const mongoose = require("mongoose");

// const pollSchema = new mongoose.Schema(
//   {
//     title: String,
//     owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//     questions: [
//       {
//         q: String,
//         options: [
//           {
//             val: String,
//             color: String,
//           },
//         ],
//         type: {
//           type: String,
//           enum: ["bar", "pie", "doughnut"],
//           default: "bar",
//         },
//         votes: [{ type: Number, default: 0 }], // Array for option votes
//         activeTime: { type: Number, default: 30 },
//       },
//     ],
//   },
//   { timestamps: true },
// );

// module.exports = mongoose.model("Poll", pollSchema);

// const mongoose = require("mongoose");

// const pollSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: [true, "Poll title is required"],
//       trim: true,
//       minlength: [3, "Title must be at least 3 characters"],
//       maxlength: [100, "Title cannot exceed 100 characters"],
//     },
//     owner: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: [true, "Poll must have an owner"],
//       index: true, // Index for faster queries by owner
//     },
//     questions: [
//       {
//         title: {
//           type: String,
//           required: [true, "Question text is required"],
//           trim: true,
//           minlength: [5, "Question must be at least 5 characters"],
//         },
//         options: [
//           {
//             val: {
//               type: String,
//               required: [true, "Option value is required"],
//               trim: true,
//             },
//             color: {
//               type: String,
//               default: () =>
//                 `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Auto-generate color
//               match: [/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"],
//             },
//           },
//         ],
//         type: {
//           type: String,
//           enum: ["bar", "pie", "doughnut"],
//           default: "bar",
//         },
//         votes: {
//           type: [Number],
//           default: [], // Will match length of options
//           // validate: {
//           //   validator: function (arr) {
//           //     return arr.length === this.options.length;
//           //   },
//           //   message: "Votes array must match the number of options",
//           // },
//         },
//         activeTime: {
//           type: Number,
//           default: 30,
//           min: [1, "Active time must be at least 1 minute"],
//           max: [1440, "Active time cannot exceed 24 hours"],
//         },
//       },
//     ],
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//     totalVotes: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },
//     voterIds: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//       },
//     ], // Optional: track unique voters
//   },
//   {
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   },
// );

// // Virtual: total votes across all questions
// pollSchema.virtual("totalVotesAcrossQuestions").get(function () {
//   return this.questions.reduce(
//     (sum, q) => sum + q.votes.reduce((a, b) => a + b, 0),
//     0,
//   );
// });

// // Pre-save hook: sync votes array length with options
// // pollSchema.pre("save", function (next) {
// //   this.questions.forEach((question) => {
// //     // Ensure votes array matches options length
// //     const targetLength = question.options.length;
// //     if (question.votes.length !== targetLength) {
// //       question.votes = Array(targetLength).fill(0);
// //     }
// //   });

// //   // Update totalVotes
// //   this.totalVotes = this.questions.reduce(
// //     (sum, q) => sum + q.votes.reduce((a, b) => a + b, 0),
// //     0,
// //   );

// //   next();
// // });

// // Index for efficient querying
// pollSchema.index({ owner: 1, createdAt: -1 });
// pollSchema.index({ isActive: 1, expiresAt: 1 });

// module.exports = mongoose.model("Poll", pollSchema);

const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema(
  {
    val: { type: String, required: true, trim: true },
    color: {
      type: String,
      default: () =>
        `#${Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "0")}`,
      match: /^#[0-9A-Fa-f]{6}$/i,
    },
  },
  { _id: true },
);

const questionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 5 },
    options: [optionSchema],
    type: { type: String, enum: ["bar", "pie", "doughnut"], default: "bar" },
    activeTime: { type: Number, default: 30, min: 1, max: 1440 },
    createdAt: { type: Date, default: Date.now, immutable: true },
  },
  { _id: true },
); // Critical: question._id

const pollSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    questions: [questionSchema],
    isActive: { type: Boolean, default: true },
    settings: {
      allowAnonymous: { type: Boolean, default: true },
      showResultsAfterVote: { type: Boolean, default: true },
      maxVoters: { type: Number, default: 10000 },
    },
    currentQuestionId: { type: mongoose.Schema.Types.ObjectId, default: null },
    startedAt: Date,
    endedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  },
);

// Indexes
pollSchema.index({ owner: 1, createdAt: -1 });
pollSchema.index({ isActive: 1 });
pollSchema.index({ currentQuestionId: 1 });

module.exports = mongoose.model("Poll", pollSchema);
