const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../config/config');
const JWT_SECRET = 'Kunci-rahasia124'; // Jangan lupa untuk mengganti dengan kunci rahasia yang aman
// Fungsi untuk login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email dan password harus diisi' });
        }
        const query = 'SELECT * FROM users WHERE email = ?';
        db.query(query, [email], async (error, results) => {
            if (error) {
                return res.status(500).json({ success: false, message: 'Internal Server Error' });
            }
            // Jika pengguna tidak ditemukan
            if (results.length === 0) {
                return res.status(400).json({ success: false, message: 'Email atau password salah' });
            }
            const user = results[0];
            // Verifikasi password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: 'Email atau password salah' });
            }

            // Buat token JWT
            const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

            res.status(200).json({
                success: true,
                message: 'Login berhasil',
                token,
            });
        });
    } catch (error) {
        res.status(102).json({ success: false, message: 'Paramter email tidak sesuai format' });
    }
});

module.exports = router;
