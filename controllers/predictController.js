// controllers/predictController.js
const tf = require("@tensorflow/tfjs-node");
const { db } = require("../utils/db");
const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

// Memuat parameter scaler
const scalerParams = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../ml-model/scaler.json"), "utf8")
);

let model;

// Memuat model saat server dimulai
(async () => {
  try {
    const modelPath = `file://${path.resolve(
      __dirname,
      "../ml-model/model.json"
    )}`;
    model = await tf.loadLayersModel(modelPath);
    console.log("Model berhasil dimuat");
  } catch (error) {
    console.error("Gagal memuat model:", error);
  }
})();

function preprocessInput(inputArray) {
  const scale = scalerParams.scale;
  const min_ = scalerParams.min;

  const scaledInput = inputArray.map((value, index) => {
    return value * scale[index] + min_[index];
  });

  return scaledInput;
}

exports.predict = async (req, res) => {
  try {
    const {
      productName,
      protein,
      energy,
      fat,
      saturated_fat,
      sugars,
      fiber,
      salt,
    } = req.body;

    // Pastikan urutan fitur sesuai dengan scaler dan model
    const inputArray = [
      protein,
      energy,
      fat,
      saturated_fat,
      sugars,
      fiber,
      salt,
    ];

    // Validasi input
    if (inputArray.some((v) => v === undefined || v === null) || !productName) {
      return res
        .status(400)
        .json({ message: "Semua input nutrisi dan nama produk wajib diisi" });
    }

    // Preprocessing input
    const processedInput = preprocessInput(inputArray);
    console.log("Processed input:", processedInput);

    const inputTensor = tf.tensor2d([processedInput]);

    // Melakukan prediksi
    const prediction = model.predict(inputTensor);
    const predictionData = await prediction.data();
    console.log("Raw prediction output:", predictionData);

    // Mengonversi prediksi menjadi grade
    const grade = mapPredictionToGrade(predictionData);
    console.log("Predicted grade:", grade);

    // Menyimpan hasil prediksi ke riwayat
    await db.collection("history").add({
      userId: req.userId,
      inputs: { protein, energy, fat, saturated_fat, sugars, fiber, salt },
      productName, // Simpan nama produk
      grade,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ grade });
  } catch (error) {
    console.error("Error during prediction:", error);
    res.status(500).json({ message: "Terjadi kesalahan saat prediksi" });
  }
};

// Fungsi untuk mengonversi prediksi menjadi grade
function mapPredictionToGrade(predictionData) {
  const grades = ["A", "B", "C", "D", "E"];
  const maxIndex = predictionData.indexOf(Math.max(...predictionData));
  return grades[maxIndex];
}
