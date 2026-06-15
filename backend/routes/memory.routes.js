import { Router } from "express";
import { authUser } from "../middleware/auth.middleware.js";
import {
  getMemories,
  createMemory,
  updateMemory,
  deleteMemory,
  clearAllMemories
} from "../controllers/memory.controller.js";

const memoryRouter = Router();

memoryRouter.get("/", authUser, getMemories);
memoryRouter.post("/", authUser, createMemory);
memoryRouter.put("/:id", authUser, updateMemory);
memoryRouter.delete("/:id", authUser, deleteMemory);
memoryRouter.delete("/", authUser, clearAllMemories);

export default memoryRouter;
