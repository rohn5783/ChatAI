import express from "express";
const app = express();
import connectDB from "../config/database.js";
import authRouter from "../routes/auth.routes.js";
import chatRouter from "../routes/chat.routes.js";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
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

connectDB();


export default app;


