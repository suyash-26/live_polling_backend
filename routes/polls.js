const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Poll = require('../models/Poll');

// Create poll (admin only)
router.post('/create', auth, async (req, res) => {
  try {
    const poll = new Poll({ ...req.body, owner: req.user.id });
    await poll.save();
    res.json({ pollId: poll._id });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get all user polls
router.get('/getUserPolls', auth, async (req, res) => {
  const polls = await Poll.find({ owner: req.user.id });
  res.json(polls);
});

// Get public poll (for presenter/participant)
router.get('/:id', async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ msg: 'Poll not found' });
    res.json(poll);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Submit vote (public, with validation)
router.post('/:id/vote', async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ msg: 'Poll not found' });

    // Simple validation: increment vote count
    Object.keys(req.body).forEach(qIndex => {
      const index = parseInt(qIndex);
      const option = parseInt(req.body[qIndex]);
      if (option >= 0 && option < poll.questions[index].votes.length) {
        poll.questions[index].votes[option]++;
      }
    });

    await poll.save();
    // Emit to sockets (handled in socket.js)
    req.io.emit('vote-update', { pollId: req.params.id, votes: poll.questions.map(q => q.votes) });
    res.json({ msg: 'Vote recorded' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// add questions
router.post("/addQuesion",auth,async(req,res,next)=>{
  const {pollId,question} = req.body;
  try{
    const poll = await Poll.findById(pollId);
    if(!poll){
      return res.status(404).json({msg:"Poll not found"});
    }
    poll.questions.push(question);
    await poll.save();
    res.json({msg:"Question added successfully"});
  }catch(err){
    res.status(500).json({msg:err.message});
  }
})

module.exports = router;