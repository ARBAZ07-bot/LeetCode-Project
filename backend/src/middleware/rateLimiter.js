const rateLimit = require('express-rate-limit');

// Judge0 wale routes ke liye — strict, kyunki API cost lagti hai
const submitLimiter = rateLimit({
    windowMs: 60 * 1000,        // 1 minute
    max: 5,                      // max 5 requests per minute per IP
    message: "Too many submissions, please try again after a minute",
    standardHeaders: true,
    legacyHeaders: false,
});

// Login ke liye — brute-force se bachne ke liye
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,   // 15 minutes
    max: 10,                     // max 10 attempts per 15 min per IP
    message: "Too many login attempts, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { submitLimiter, loginLimiter };