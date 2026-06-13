import { Router } from "express";
import { registerValidator, loginValidator } from "../validators/auth.validator.js";
import { register, login, logout, getMe, verifyEmail, quickLogin } from "../controllers/auth.controller.js";
import {authUser} from "../middleware/auth.middleware.js";

const authRouter = Router();


authRouter.post("/register", registerValidator, register);
authRouter.post("/login", loginValidator, login)
authRouter.post("/quick-login", quickLogin);
authRouter.post("/logout", logout)
authRouter.get("/me", authUser, getMe);
authRouter.get("/verify-email", verifyEmail);

export default authRouter;
