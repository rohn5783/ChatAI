import userModel from "../model/user.model.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/mail.service.js";


export  async function register(req, res) {
const {username, email, password} = req.body;
const isUserAlreadyExist = await userModel.findOne({ $or: [{ email }, { username }] });
if (isUserAlreadyExist) {
    return res.status(400).json({ message: "User already exist",
        success: false,
        err: "User already exists"
     });
    }
const user = await userModel.create({ username, email, password });
const emailVerificationToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  await sendEmail({
        to: email,
        subject: "Welcome to Perplexity!",
        html: `
                <p>Hi ${username},</p>
                <p>Thank you for registering at <strong>Perplexity</strong>. We're excited to have you on board!</p>
                <p>Please verify your email address by clicking the link below:</p>
                <a href="http://localhost:3000/api/auth/verify-email?token=${emailVerificationToken}">Verify Email</a>
                <p>If you did not create an account, please ignore this email.</p>
                <p>Best regards,<br>The Perplexity Team</p>
        `
    });
// Here you would send the email with the verification link containing the token
res.status(201).json({ message: "User registered successfully. Please verify your email.",
    success: true,
   user: {
       id: user._id,
       username: user.username,
       email: user.email,
   }
 });

}



export async function login(req, res) {
const {email, password} = req.body;
const user = await userModel.findOne({ email });
if (!user) {
    return res.status(400).json({ message: "User not found",
        success: false,
        err: "User not found"
     });
    }
if (!user.comparePassword(password)) {
    return res.status(400).json({ message: "Incorrect password",
        success: false,
        err: "Incorrect password"
     });
    }


   if (!user.verified) {
        return res.status(400).json({
            message: "Please verify your email before logging in",
            success: false,
            err: "Email not verified"
        })
    }


const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
res.status(200).json({ message: "Login successful",
    success: true,
    token,
    user: {
        id: user._id,
        username: user.username,
        email: user.email,
    }
})
}





export async function getMe(req, res) {
    const userId = req.userId;
    const user = await userModel.findById(userId).select('-password');
    if (!user) {
        return res.status(400).json({ message: "User not found",
            success: false,
            err: "User not found"
         });
        }
    res.status(200).json({ message: "User fetched successfully",
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
        }
    })
}


export async function verifyEmail(req, res) {
    const { token } = req.query;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decoded.userId);

        if (!user) {
            return res.status(400).json({
                message: "Invalid token",
                success: false,
                err: "User not found"
            });
        }

        user.verified = true;
        await user.save();

        return res.send(`
            <h1>Email Verified Successfully!</h1>
            <p>You can now login.</p>
            <a href="http://localhost:3000/login">Login</a>
        `);

    } catch (err) {
        return res.status(400).json({
            message: "Invalid or expired token",
            success: false,
            err: err.message
        });
    }
}




