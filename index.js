const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Update this to your frontend URL if different
    methods: ["GET", "POST"],
  },
});

app.use(cors());

// Store users' roles in memory for demonstration purposes
const userRoles = {}; // Format: { userId: role }

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("joinRoom", async (payload) => {
    const { chatId, senderId, role } = JSON.parse(payload);

    try {
      socket.join(chatId);

      const message = `${role} joined chat room: ${chatId}`;

      const chatMessage = {
        senderId,
        role,
        message,
        timestamp: new Date().toISOString(),
      };

      io.to(chatId).emit("message", chatMessage);
    } catch (error) {
      socket.emit("error", error.message);
    }
  });

  socket.on("chatMessage", async (msg) => {
    const parseData = JSON.parse(msg);
    const { chatId, senderId, message, role } = parseData;

    try {
      const chatMessage = {
        senderId,
        role,
        message,
        timestamp: new Date().toISOString(),
      };

      io.to(chatId).emit("message", chatMessage);
    } catch (error) {
      socket.emit("error", error.message);
    }
  });

  socket.on("closeChat", async (payload) => {
    const { chatId, senderId } = JSON.parse(payload);

    try {
      const message = `Chat is closed: ${chatId}`;
      const chatMessage = {
        senderId,
        message,
        timestamp: new Date().toISOString(),
      };

      io.to(chatId).emit("message", chatMessage);
      socket.leave(chatId);
    } catch (error) {
      socket.emit("error", error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(5000, () => {
  console.log("Server listening on port 5000");
});
