const redisClient = require("../config/redis");
const User = require("../models/user")
const validate = require('../utils/validator');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const Submission = require("../models/submission")
const sendOtpEmail = require("../utils/sendEmail")


const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const register = async (req, res) => {

    let createdUser;
    try {
        validate(req.body);
        const { firstName, emailId, password } = req.body;

        req.body.password = await bcrypt.hash(password, 10);
        req.body.role = 'user'

        const otp = generateOtp();
        req.body.otp = await bcrypt.hash(otp, 10);
        req.body.otpExpiry = Date.now() + 10 * 60 * 1000;
        req.body.isVerified = false;

        createdUser = await User.create(req.body);

        try {
            await sendOtpEmail(createdUser.emailId, otp);
        } catch (emailErr) {
            await User.findByIdAndDelete(createdUser._id);
            throw new Error("Couldn't send verification email. Please check your email address and try again.");
        }

        res.status(201).json({
            emailId: createdUser.emailId,
            message: "OTP sent to your email. Please verify to continue."
        })
    }
    catch (err) {
        res.status(400).send("Error: " + (err.message || err));
    }
}


const login = async (req, res) => {

    try {
        const { emailId, password } = req.body;

        if (!emailId)
            throw new Error("Invalid Credentials");
        if (!password)
            throw new Error("Invalid Credentials");

        const user = await User.findOne({ emailId });

        if (!user)
            throw new Error("Invalid Credentials");

        const match = await bcrypt.compare(password, user.password);

        if (!match)
            throw new Error("Invalid Credentials");

        if (!user.isVerified)
            throw new Error("Please verify your email before logging in");

        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role,
        }

        const token = jwt.sign({ _id: user._id, emailId: emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: 60 * 60 });
        res.cookie('token', token, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });
        res.status(201).json({
            user: reply,
            message: "Loggin Successfully"
        })
    }
    catch (err) {
        res.status(401).send("Error: " + err);
    }
}


const verifyOtp = async (req, res) => {
    try {
        const { emailId, otp } = req.body;

        if (!emailId || !otp)
            throw new Error("Email and OTP are required");

        const user = await User.findOne({ emailId });
        if (!user)
            throw new Error("User not found");

        if (user.isVerified)
            throw new Error("Account already verified");

        if (!user.otp || !user.otpExpiry || user.otpExpiry < Date.now())
            throw new Error("OTP expired, please request a new one");

        const match = await bcrypt.compare(otp, user.otp);
        if (!match)
            throw new Error("Invalid OTP");

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role,
        }

        const token = jwt.sign({ _id: user._id, emailId: user.emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: 60 * 60 });
        res.cookie('token', token, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });

        res.status(200).json({
            user: reply,
            message: "Email verified successfully"
        })
    }
    catch (err) {
        res.status(400).send("Error: " + err);
    }
}


const resendOtp = async (req, res) => {
    try {
        const { emailId } = req.body;
        if (!emailId)
            throw new Error("Email is required");

        const user = await User.findOne({ emailId });
        if (!user)
            throw new Error("User not found");

        if (user.isVerified)
            throw new Error("Account already verified");

        const otp = generateOtp();
        user.otp = await bcrypt.hash(otp, 10);
        user.otpExpiry = Date.now() + 10 * 60 * 1000;
        await user.save();

        await sendOtpEmail(user.emailId, otp);

        res.status(200).send("OTP resent successfully");
    }
    catch (err) {
        res.status(400).send("Error: " + err);
    }
}


const logout = async (req, res) => {

    try {
        const { token } = req.cookies;
        const payload = jwt.decode(token);

        await redisClient.set(`token:${token}`, 'Blocked');
        await redisClient.expireAt(`token:${token}`, payload.exp);

        res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });
        res.send("Logged Out Succesfully");
    }
    catch (err) {
        res.status(503).send("Error: " + err);
    }
}


const adminRegister = async (req, res) => {
    try {
        if (req.user.role != 'admin')
            throw new Error("Invalid Credentials");

        validate(req.body);
        const { firstName, emailId, password } = req.body;

        req.body.password = await bcrypt.hash(password, 10);
        req.body.role = 'admin';
        req.body.isVerified = true;

        const user = await User.create(req.body);
        const token = jwt.sign({ _id: user._id, emailId: emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: 60 * 60 });
        res.cookie('token', token, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });
        res.status(201).send("User Registered Successfully");
    }
    catch (err) {
        res.status(400).send("Error: " + err);
    }
}

const deleteProfile = async (req, res) => {

    try {
        const userId = req.user._id;

        await User.findByIdAndDelete(userId);
        await Submission.deleteMany({ userId });

        res.status(200).send("Deleted Successfully");
    }
    catch (err) {
        res.status(500).send("Internal Server Error");
    }
}

const getProfile = async (req, res) => {
    try {
        res.status(200).json({ user: req.user });
    }
    catch (err) {
        res.status(400).send("Error: " + err);
    }
}


module.exports = { register, login, logout, adminRegister, deleteProfile, getProfile, verifyOtp, resendOtp };