import express from "express";
import http from "http";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Server } from "socket.io";
import authRoutes from "./Routes/auth.js";
import chatRoutes from "./Routes/chat.js";
import messageRoutes from "./Routes/message.js";
import { verifyToken } from "./Routes/Middleware.js";
import { socketHandler } from "./sockets/socketHandler.js";
import cloudinaryRoute from "./Routes/cloudinary.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

app.use("/api/cloud", cloudinaryRoute);
app.use("/api/auth", authRoutes);
app.use("/api/chats", verifyToken, chatRoutes);
app.use("/api/messages", verifyToken, messageRoutes);

io.on("connection", (socket) => socketHandler(socket, io));

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    server.listen(process.env.PORT || 5000, () => {
      console.log("✅ Server running on port", process.env.PORT || 5000);
    });
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
