import express from "express";
const app = express();
import connectDB from "../config/database.js";
import authRouter from "../routes/auth.routes.js";
import chatRouter from "../routes/chat.routes.js";
import cookieParser from "cookie-parser";
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.get("/", (req, res) => {
    res.json({ message: "Server is running" });
});

app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);

connectDB();


export default app;


