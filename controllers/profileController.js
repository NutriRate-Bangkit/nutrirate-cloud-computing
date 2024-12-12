// controllers/profileController.js

const { db } = require("../utils/db");

exports.getProfile = async (req, res) => {
  try {
    const userDoc = await db.collection("users").doc(req.userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "Profil tidak ditemukan" });
    }

    const userData = userDoc.data();
    res.json({
      name: userData.name,
      email: userData.email,
      image: userData.image,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, image } = req.body;

    // Perbarui data pengguna di Firestore
    await db.collection("users").doc(req.userId).update({
      name,
      email,
      image,
    });

    res.json({ message: "Profil berhasil diperbarui" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validasi input
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Password lama dan baru wajib diisi" });
    }

    // Dapatkan email pengguna dari Firestore
    const userDoc = await db.collection("users").doc(req.userId).get();
    const userEmail = userDoc.data().email;

    // Otentikasi ulang pengguna
    const userCredential = await signInWithEmailAndPassword(
      firebaseAuth,
      userEmail,
      currentPassword
    );

    // Update password
    await updatePassword(userCredential.user, newPassword);

    res.json({ message: "Password berhasil diubah" });
  } catch (error) {
    console.error("Error changing password:", error);

    if (error.code === "auth/wrong-password") {
      return res.status(401).json({ message: "Password saat ini salah" });
    }

    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    // Hapus akun dari Firebase Authentication
    await auth.deleteUser(req.userId);

    // Hapus data pengguna dari Firestore
    await db.collection("users").doc(req.userId).delete();

    res.json({ message: "Akun berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};
