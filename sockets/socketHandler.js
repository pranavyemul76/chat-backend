export const socketHandler = (socket, io) => {
  console.log("🔌 New client connected:", socket.id);

  socket.on("join-chat", (chatId) => {
    socket.join(chatId);
  });

  socket.on("send-message", (message) => {
    io.to(message.chat).emit("receive-message", message);
  });

  socket.on("seen-message", ({ chatId, userId }) => {
    io.to(chatId).emit("message-seen", { chatId, userId });
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
};
