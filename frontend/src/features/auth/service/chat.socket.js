import { io } from "socket.io-client";

export const initializeSocketCoonection = () => {
  const token = localStorage.getItem("token");
  const socket = io("http://localhost:3000", {
    auth: { token },
    withCredentials: true,
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("connected", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("disconnected");
  });

  return socket;
};

