import express from "express";
const app = express();
import path from "path";
import connectDB from "../config/database.js";
import authRouter from "../routes/auth.routes.js";
import chatRouter from "../routes/chat.routes.js";
import aiRouter from "../routes/ai.routes.js";
import memoryRouter from "../routes/memory.routes.js";
import fileRouter from "../routes/file.routes.js";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import cors from "cors";
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    
}));
app.use(cookieParser());
app.get("/", (req, res) => {
    res.json({ message: "Server is running" });
});

app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);
app.use("/api/ai", aiRouter);
app.use("/api/memories", memoryRouter);
app.use("/api/files", fileRouter);

connectDB();

export default app;
