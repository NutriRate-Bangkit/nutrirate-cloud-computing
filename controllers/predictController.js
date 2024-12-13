// controllers/predictController.js
const tf = require('@tensorflow/tfjs-node');
const { db } = require('../utils/db');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Memuat parameter scaler
const scalerParams = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../ml-model/scaler.json'), 'utf8')
);

let model;
  
// Memuat model saat server dimulai
(async () => {
  try {
    const modelPath = `file://${path.resolve(__dirname, '../ml-model/model.json')}`; 
    model = await tf.loadLayersModel(modelPath);
    console.log('Model berhasil dimuat');
  } catch (error) {
    console.error('Gagal memuat model:', error);
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

// Fungsi konversi nutrisi ke per 100g
function convertTo100g(value, gramPerServing) {
  return (value * 100) / gramPerServing;
}

exports.predict = async (req, res) => {
  try {
    const { 
      productName, 
      protein, 
      energy, 
      fat, 
      saturatedFat, 
      sugars, 
      fiber, 
      sodium, 
      gramPerServing 
    } = req.body;

    // Validasi input
    if ([protein, energy, fat, saturatedFat, sugars, fiber, sodium, gramPerServing].some(v => v === undefined || v === null) || !productName) {
      return res.status(400).json({ message: 'Semua input nutrisi, nama produk, dan gram per serving wajib diisi' });
    }

    // Konversi energi dari kkal ke kj
    const energyKj = energy * 4.18;

    // Konversi sodium ke garam
    const salt = (sodium * 2.5) / 1000;

    // Konversi semua nutrisi ke per 100g
    const convertedInputs = {
      protein: convertTo100g(protein, gramPerServing),
      energy: convertTo100g(energyKj, gramPerServing),
      fat: convertTo100g(fat, gramPerServing),
      saturatedFat: convertTo100g(saturatedFat, gramPerServing),
      sugars: convertTo100g(sugars, gramPerServing),
      fiber: convertTo100g(fiber, gramPerServing),
      salt: convertTo100g(salt, gramPerServing)
    };

    console.log('Converted inputs:', convertedInputs);

    // Pastikan urutan fitur sesuai dengan scaler dan model
    const inputArray = [
      convertedInputs.protein, 
      convertedInputs.energy, 
      convertedInputs.fat, 
      convertedInputs.saturatedFat, 
      convertedInputs.sugars, 
      convertedInputs.fiber, 
      convertedInputs.salt
    ];

    // Preprocessing input
    const processedInput = preprocessInput(inputArray);
    console.log('Processed input:', processedInput);

    const inputTensor = tf.tensor2d([processedInput]);

    // Melakukan prediksi
    const prediction = model.predict(inputTensor);
    const predictionData = await prediction.data();
    console.log('Raw prediction output:', predictionData);

    // Mengonversi prediksi menjadi grade
    const grade = mapPredictionToGrade(predictionData);
    console.log('Predicted grade:', grade);

    // Menyimpan hasil prediksi ke riwayat
    await db.collection('history').add({
      userId: req.userId,
      inputs: { 
        protein: convertedInputs.protein, 
        energy: convertedInputs.energy, 
        fat: convertedInputs.fat, 
        saturatedFat: convertedInputs.saturatedFat, 
        sugars: convertedInputs.sugars, 
        fiber: convertedInputs.fiber, 
        salt: convertedInputs.salt 
      },
      originalInputs: { 
        protein, 
        energy, 
        fat, 
        saturatedFat, 
        sugars, 
        fiber, 
        sodium 
      },
      productName,
      gramPerServing,
      grade,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      grade,
      productName,
      originalInputs: {
        protein,
        energy,
        fat,
        saturatedFat,
        sugars,
        fiber,
        sodium
      }
    });
  } catch (error) {
    console.error('Error during prediction:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat prediksi' });
  }
};

// Fungsi untuk mengonversi prediksi menjadi grade
function mapPredictionToGrade(predictionData) {
  const grades = ['A', 'B', 'C', 'D', 'E'];
  const maxIndex = predictionData.indexOf(Math.max(...predictionData));
  return grades[maxIndex];
}
