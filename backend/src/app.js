import express from "express";
const app = express();
import connectDB from "../config/database.js";

connectDB();


export default app;


