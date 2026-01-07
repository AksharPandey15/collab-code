const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const ACTIONS = require("./Actions"); // Your predefined socket actions

const app = express();
const server = http.createServer(app);

// ======= Configuration =======
const PORT = process.env.PORT || 12345;
const languageConfig = {
  python3: { versionIndex: "3" },
  java: { versionIndex: "3" },
  cpp: { versionIndex: "4" },
  nodejs: { versionIndex: "3" },
  c: { versionIndex: "4" },
  ruby: { versionIndex: "3" },
  go: { versionIndex: "3" },
  scala: { versionIndex: "3" },
  bash: { versionIndex: "3" },
  sql: { versionIndex: "3" },
  pascal: { versionIndex: "2" },
  csharp: { versionIndex: "3" },
  php: { versionIndex: "3" },
  swift: { versionIndex: "3" },
  rust: { versionIndex: "3" },
  r: { versionIndex: "3" },
};

// ======= Middleware =======
app.use(cors({ origin: "http://localhost:3000", methods: ["GET", "POST"] }));
app.use(express.json());

// ======= Socket.IO Setup =======
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const userSocketMap = {};

// Helper: Get all clients in a room
const getAllConnectedClients = (roomId) =>
  Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => ({
    socketId,
    username: userSocketMap[socketId],
  }));

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // User joins a room
  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    if (!username || !roomId) return;

    userSocketMap[socket.id] = username;
    socket.join(roomId);

    const clients = getAllConnectedClients(roomId);

    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });

    console.log(`${username} joined room: ${roomId}`);
  });

  // Broadcast code changes to other clients
  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  // Sync code with newly joined user
  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  // Handle user disconnecting
  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });

    console.log(`User disconnected: ${userSocketMap[socket.id]}`);
    delete userSocketMap[socket.id];
  });
});

// ======= Code Compilation Endpoint =======
app.post("/compile", async (req, res) => {
  const { code, language } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: "Code and language are required" });
  }

  const langConfig = languageConfig[language.toLowerCase()];
  if (!langConfig) {
    return res.status(400).json({ error: "Unsupported language" });
  }

  try {
    const response = await axios.post(
      "https://api.jdoodle.com/v1/execute",
      {
        script: code,
        language,
        versionIndex: langConfig.versionIndex,
        clientId: process.env.JDOODLE_CLIENT_ID,
        clientSecret: process.env.JDOODLE_CLIENT_SECRET,
      },
      { headers: { "Content-Type": "application/json" }, timeout: 10000 }
    );

    res.json(response.data);
  } catch (error) {
    console.error("JDoodle error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to compile code" });
  }
});

// ======= Start Server =======
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
