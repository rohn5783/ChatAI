import { Router } from "express";
import { authUser } from "../middleware/auth.middleware.js";
import upload from "../services/upload.service.js";
import {
  uploadFile,
  getFiles,
  deleteFile
} from "../controllers/file.controller.js";

const fileRouter = Router();

fileRouter.post("/upload", authUser, upload.single("file"), uploadFile);
fileRouter.get("/", authUser, getFiles);
fileRouter.delete("/:id", authUser, deleteFile);

export default fileRouter;
