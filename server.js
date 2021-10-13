import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { resolve } from "path";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.sendFile(resolve("./client.html"));
});

let onlineUsers = 0;

io.on("connection", (socket) => {
  onlineUsers++;
  io.emit("online users changed", onlineUsers);
  // console.log("someone is connected.");

  socket.on("newMessage", (nickname, message) => {
    socket.broadcast.emit("newMessage", nickname, message);
    console.log(nickname + message);
  });

  socket.on("join room", (name, roomName) => {
    const id = socket.rooms.keys().next().value;
    socket.join(roomName);
    io.to(id).emit("room event", roomName, name); // NOTE : room message - we can use it as private message
    // socket.emit("room event", roomName, name);
    io.to(roomName).emit("join room event", roomName, name);
  });

  socket.on("disconnect", () => {
    onlineUsers--;
    io.emit("online users changed", onlineUsers);
  });
});

httpServer.listen(port, () => console.log(`Server running on port ${port}`));
