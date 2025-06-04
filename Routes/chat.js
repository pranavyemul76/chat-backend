import express, { response } from "express";
import Chat from "../models/Chat.js";
import User from "../models/User.js";
const router = express.Router();

// Create or find private chat
router.post("/private", async (req, res) => {
  const { userId } = req.user;
  const { userId2 } = req.body;
  try {
    const UserData = await User.findOne({ email: userId2 });
    if (!UserData)
      return res.json({
        message: "User Not Exist",
        success: false,
        type: "error",
      });
    let chat = await Chat.findOne({
      isGroup: false,
      members: { $all: [userId, UserData._id] },
    });
    if (chat)
      return res.json({
        message: "User Already Exist in Chat",
        success: false,
        type: "error",
      });
    if (!chat) {
      chat = new Chat({ members: [userId, UserData._id] });
      await chat.save();
      const fullChat = {
        ...chat.toObject(),
        members: [
          {
            username: UserData.username,
            email: UserData.email,
          },
        ],
        success: true,
      };
      res.status(200).json({
        message: "User Added in chat",
        type: "success",
        data: fullChat,
        success: true,
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message, type: "error" });
  }
});

// Create group chat
router.post("/group", async (req, res) => {
  const { name, members } = req.body;
  const { userId } = req.user;
  try {
    const users = (
      await User.find({ email: { $in: members } }).select("_id")
    ).map((item) => item.id);
    users.push(userId);
    const chat = new Chat({
      name,
      isGroup: true,
      members: users,
      admin: userId,
    });
    const SavedData = await chat.save();
    const Response = {
      ...SavedData.toObject(),
      success: true,
      message: "Group created SuccessFully",
      name: name,
    };
    res.status(201).json({ data: Response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/get-all-chats", async (req, res) => {
  try {
    const { userId } = req.user;
    const chats = await Chat.find({ members: userId })
      .populate("members", "username email _id")
      .populate("admin", "username email _id")
      .lean();
    const filteredChats = chats.map((chat) => ({
      ...chat,
      members: chat.members.filter(
        (member) => member._id.toString() !== userId
      ),
    }));
    res.status(200).json(filteredChats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
