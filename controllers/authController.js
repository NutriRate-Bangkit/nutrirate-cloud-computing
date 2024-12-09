// controllers/authController.js
const { auth, firebaseAuth, sendPasswordResetEmail } = require('../utils/db');

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi' });
    }

    // Buat pengguna di Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      password,
    });

    res.status(201).json({ message: 'Registrasi berhasil', userId: userRecord.uid });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi' });
    }

    // Login menggunakan Firebase Authentication
    const user = await auth.getUserByEmail(email);

    // Tidak ada pengecekan password manual di sisi server (Firebase SDK akan menanganinya)
    res.status(200).json({ message: 'Login berhasil', userId: user.uid, email: user.email });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(401).json({ message: 'Email atau password salah' });
  }
};

exports.logout = async (req, res) => {
  try {
    // Pada Firebase Authentication, logout biasanya dilakukan di sisi client
    // Di sisi server, kita bisa memberi response sukses
    res.status(200).json({ message: 'Logout berhasil' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: 'Gagal logout' });
  }
};  

exports.resetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email wajib diisi' });
    }

    // Kirim email reset password menggunakan Firebase Authentication client
    await sendPasswordResetEmail(firebaseAuth, email);

    res.status(200).json({ 
      message: 'Link reset password telah dikirim ke email Anda',
      email: email 
    });
  } catch (error) {
    console.error('Error sending reset password email:', error);
    
    // Tangani error spesifik dari Firebase
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ message: 'Email tidak terdaftar' });
    }
    
    if (error.code === 'auth/invalid-email') {
      return res.status(400).json({ message: 'Format email tidak valid' });
    }
    
    res.status(500).json({ message: 'Gagal mengirim email reset password' });
  }
};