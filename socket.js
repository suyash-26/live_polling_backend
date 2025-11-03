const Poll = require("./models/Poll");

module.exports = (io) => {
  io.on('connection', (socket) => {
    socket.on('join-poll', (pollId) => {
      socket.join(pollId);
    });

    socket.on('push-question', ({pollId, questionId }) => {
      // Logic to push question
      const poll = Poll.findById(pollId);
      if (!poll) return;
      console.log("Pushing question", questionId, "to poll", pollId);
      io.to(pollId).emit('question-pushed', { questionId });
    });
  });
};