import { Router } from "express";
import { registerValidator, loginValidator } from "../validators/auth.validator.js";
import { register, login, getMe, verifyEmail } from "../controllers/auth.controller.js";
import {authUser} from "../middleware/auth.middleware.js";

const authRouter = Router();


authRouter.post("/register", registerValidator, register);
authRouter.post("/login", loginValidator, login)
authRouter.get("/me", authUser, getMe);
authRouter.get("/verify-email", verifyEmail);

export default authRouter;