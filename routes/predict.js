// routes/predict.js
const express = require("express");
const router = express.Router();
const { predict } = require("../controllers/predictController");
const auth = require("../middleware/auth");

router.post("/", auth, predict);

module.exports = router;
