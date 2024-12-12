// routes/profile.js
const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} = require("../controllers/profileController");
const auth = require("../middleware/auth");

router.get("/", auth, getProfile);
router.put("/", auth, updateProfile);
router.put("/change-password", auth, changePassword);
router.delete("/", auth, deleteAccount);

module.exports = router;
