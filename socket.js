const Poll = require("./models/Poll");

module.exports = (io) => {
  io.on('connection', (socket) => {
    socket.on('join-poll', (pollId) => {
      socket.join(pollId);
    });

    socket.on('push-question', async ({pollId, questionId }) => {
      // Logic to push question
      const poll = await Poll.findById(pollId);
      if (!poll) return;
      poll.questions?.forEach((q) => {
        if (q.id === questionId) {
          q.isActive = true;
          q.lastActivatedAt = Date.now();
        }else{
          q.isActive = false;
        }
      });
      await poll.save();
      io.to(pollId).emit('question-pushed', { questionId, questions: poll.questions });
    });
  });
};