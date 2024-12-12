// controllers/authController.js
const {
  db,
  auth,
  firebaseAuth,
  sendPasswordResetEmail,
  firebaseApp,
} = require("../utils/db");
const { signInWithEmailAndPassword } = require("firebase/auth");

exports.register = async (req, res) => {
  try {
    const { name, email, password, image } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Nama, email, dan password wajib diisi" });
    }

    // Buat pengguna di Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      password,
    });

    // Simpan data pengguna ke Firestore
    await db
      .collection("users")
      .doc(userRecord.uid)
      .set({
        name,
        email,
        image: image || null, // Jika image tidak ada, simpan sebagai null
      });

    res
      .status(201)
      .json({ message: "Registrasi berhasil", userId: userRecord.uid });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email dan password wajib diisi" });
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        firebaseAuth,
        email,
        password
      );
      const user = userCredential.user;

      const idToken = await user.getIdToken();

      res.status(200).json({
        message: "Login berhasil",
        userId: user.uid,
        email: user.email,
        token: idToken, // Ini adalah token yang bisa digunakan tim mobile
      });
    } catch (authError) {
      console.error("Authentication error details:", authError);

      // Tangani kesalahan Firebase Authentication berdasarkan kode
      if (authError.code === "auth/wrong-password") {
        return res.status(401).json({ message: "Email atau password salah" });
      }
      if (authError.code === "auth/user-not-found") {
        return res.status(404).json({ message: "Email tidak terdaftar" });
      }

      // Jika kesalahan tidak teridentifikasi
      res.status(500).json({ message: "Gagal login" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

exports.logout = async (req, res) => {
  try {
    // Pada Firebase Authentication, logout biasanya dilakukan di sisi client
    // Di sisi server, kita bisa memberi response sukses
    res.status(200).json({ message: "Logout berhasil" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Gagal logout" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email wajib diisi" });
    }

    // Kirim email reset password menggunakan Firebase Authentication client
    await sendPasswordResetEmail(firebaseAuth, email);

    res.status(200).json({
      message: "Link reset password telah dikirim ke email Anda",
      email: email,
    });
  } catch (error) {
    console.error("Error sending reset password email:", error);

    // Tangani error spesifik dari Firebase
    if (error.code === "auth/user-not-found") {
      return res.status(404).json({ message: "Email tidak terdaftar" });
    }

    if (error.code === "auth/invalid-email") {
      return res.status(400).json({ message: "Format email tidak valid" });
    }

    res.status(500).json({ message: "Gagal mengirim email reset password" });
  }
};
