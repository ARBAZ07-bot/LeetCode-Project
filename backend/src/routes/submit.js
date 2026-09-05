const express = require('express');
const submitRouter = express.Router();
const userMiddleware = require("../middleware/userMiddleware");
const { submitLimiter } = require("../middleware/rateLimiter");
const {submitCode, runCode} = require("../controllers/userSubmission");

submitRouter.post("/submit/:id", userMiddleware, submitLimiter, submitCode);
submitRouter.post("/run/:id", userMiddleware, submitLimiter, runCode);

module.exports = submitRouter;