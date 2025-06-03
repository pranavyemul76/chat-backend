import express from "express";
import Message from "../models/Message.js";
const router = express.Router();

// Send message
router.post("/", async (req, res) => {
  const { chatId, text, mediaUrl } = req.body;
  const { userId } = req.user;
  try {
    const message = new Message({
      sender: userId,
      chat: chatId,
      text,
      mediaUrl,
    });
    const ResponseData = await message.save();
    ResponseData.sender = { email: req.email };
    res.status(201).json(ResponseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get messages of chat
router.get("/:chatId", async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "email -_id")
      .populate("seenBy", "email -_id")
      .lean();
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.put("/seen/:chatId/:userId", async (req, res) => {
  try {
    await Message.updateMany(
      {
        chat: req.params.chatId,
        seenBy: { $ne: req.params.userId },
      },
      { $push: { seenBy: req.params.userId } }
    );
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
export default router;
