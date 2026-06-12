import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

function getTokenFromCookie(cookieHeader = "") {
  // cookieHeader looks like: "token=abc; other=..."
  const cookies = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .filter(Boolean);

  for (const c of cookies) {
    const [key, ...rest] = c.split("=");
    if (key === "token") return decodeURIComponent(rest.join("="));
  }
  return null;
}

function getSocketToken(socket) {
  return (
    socket.handshake?.auth?.token ||
    getTokenFromCookie(socket.handshake?.headers?.cookie)
  );
}

export function initServer(httpserver) {
  io = new Server(httpserver, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  console.log("Socket.io server is running");

  io.on("connection", (socket) => {
    try {
      const token = getSocketToken(socket);
      if (!token) {
        // You’ll see this in logs; socket can still connect, but is unauthorized.
        console.log("Socket unauthorized: No token provided");
        socket.userId = null;
      } else {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded?.userId ?? null;
        console.log("Socket authenticated userId:", socket.userId);
      }
    } catch (e) {
      console.log("Socket unauthorized: Invalid token", e?.message);
      socket.userId = null;
    }

    console.log("a user connected" + socket.id);

    socket.on("disconnect", () => {
      console.log("user disconnected" + socket.id);
    });

    // Example guard for an event you might be using.
    // Add your real socket events below.
    socket.on("sendMessage", (payload) => {
      if (!socket.userId) {
        return socket.emit("messageError", {
          message: "Unauthorized",
          success: false,
          err: "No token provided",
        });
      }

      // TODO: implement actual message handling here if you are using sockets for sending.
      // payload: { message, chatId }
    });
  });
}

