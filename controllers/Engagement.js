const mongoose = require("mongoose");

// Schema to track user engagement
const engagementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date }
});

const Engagement = mongoose.model("Engagement", engagementSchema);

// Function to record session start
exports.startSession = async (req, res) => {
  try {
    const { userId } = req.body;

    const newSession = new Engagement({
      userId,
      startTime: new Date()
    });
    await newSession.save();
    return res.status(200).json({ success: true, message: "Session started" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
  
};

// Function to record session end
exports.endSession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await Engagement.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    session.endTime = new Date();
    await session.save();

    return res.status(200).json({ success: true, message: "Session ended" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Function to calculate total engagement time
exports.getTotalEngagementTime = async (req, res) => {
  try {
    const sessions = await Engagement.find({ endTime: { $ne: null } });

    const totalEngagementTime = sessions.reduce((total, session) => {
      const duration = session.endTime - session.startTime;
      return total + duration;
    }, 0);

    return res.status(200).json({
      success: true,
      totalEngagementTime: totalEngagementTime / 1000 // Convert to seconds
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
