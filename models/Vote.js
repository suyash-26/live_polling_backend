const mongoose = require("mongoose");

// const voteSchema = new mongoose.Schema(
//   {
//     poll: { type: mongoose.Schema.Types.ObjectId, ref: "Poll" },
//     questionIndex: Number,
//     optionIndex: Number,
//     voterId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   },
//   { timestamps: true },
// );

// module.exports = mongoose.model("Vote", voteSchema);

const voteSchema = new mongoose.Schema(
  {
    poll: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll",
      required: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll.questions",
      required: true,
    },
    option: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll.questions.options",
      required: true,
    },
    voterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// Indexes
voteSchema.index({ poll: 1 });
voteSchema.index({ question: 1 });
voteSchema.index({ poll: 1, question: 1, voterId: 1 }, { unique: true });
voteSchema.index({ poll: 1, question: 1, option: 1 }); // For counting


// Pre-save hook to validate references of question and option within the poll
voteSchema.pre("save", async function (next) {
  try {
    const Poll = mongoose.model("Poll");
    const poll = await Poll.findById(this.poll);
    if (!poll) throw new Error("Invalid poll");

    const question = poll.questions.id(this.question);
    if (!question) throw new Error("Invalid question");

    // Only if option has _id
    if (question.options.id) {
      const option = question.options.id(this.option);
      if (!option) throw new Error("Invalid option");
    }

    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Vote", voteSchema);
