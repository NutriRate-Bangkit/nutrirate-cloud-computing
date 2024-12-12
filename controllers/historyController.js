const { db } = require("../utils/db");
const admin = require("firebase-admin");

exports.getHistory = async (req, res) => {
  try {
    console.log("Fetching history for user ID:", req.userId);

    const historyRef = db
      .collection("history")
      .where("userId", "==", req.userId)
      .orderBy("timestamp", "desc");

    const snapshot = await historyRef.get();

    let history = [];
    snapshot.forEach((doc) => {
      history.push({ id: doc.id, ...doc.data() });
    });

    res.json({ history });
  } catch (error) {
    console.error("Error fetching history:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};
