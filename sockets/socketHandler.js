export const socketHandler = (socket, io) => {
  console.log("🔌 New client connected:", socket.id);

  socket.on("join-chat", (chatId) => {
    socket.join(chatId);
  });

  socket.on("send-message", (message) => {
    io.to(message.chat).emit("receive-message", message);
  });

  socket.on("seen-message", ({ chatId, userId, messageId }) => {
    io.to(chatId).emit("message-seen", { userId, messageId });
  });

  socket.on("typing", ({ chatId, userEmail }) => {
    socket.to(chatId).emit("typing", { userEmail });
  });

  socket.on("stop-typing", ({ chatId, userEmail }) => {
    socket.to(chatId).emit("stop-typing", { userEmail });
  });
  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
};
