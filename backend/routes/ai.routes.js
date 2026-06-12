import { Router } from "express";
import { askAI } from "../controllers/ai.controller.js";

const aiRouter = Router();

aiRouter.post("/ask", askAI);

export default aiRouter;
