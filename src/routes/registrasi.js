const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../config/config'); // Koneksi ke database
const saltRounds = 10; // Jumlah putaran hash

// Fungsi untuk registrasi

router.post('/registration', async (req, res) => {
try {
    const { email, first_name, last_name, password } = req.body;
    if(password.length < 8){
        return res.status(400).json({ success: false, message: 'password minimal 8' });
    } 
    // Hash password menggunakan bcrypt
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // Validasi input
    if (!email || !first_name || !last_name || !password) {
        return res.status(400).json({ success: false, message: 'Semua data harus diisi' });
  }
  // Query untuk menyimpan pengguna ke database
  const query = 'INSERT INTO users (email, first_name, last_name, password) VALUES (?, ?, ?, ?)';
  db.query(query, [email, first_name, last_name, hashedPassword], (error, results) => {
    if (error) return res.status(500).json({ success: false, message: 'Internal Server Error' });

    res.status(201).json({ success: true, message: 'Registrasi berhasil silahkan login' });
  });
} catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
    
}});
module.exports = router;