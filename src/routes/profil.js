// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../config/config');

router.post('/profile', authMiddleware, (req, res) => {
    const { profile_image } = req.body;
    const userId = req.user.userId;

    const query = 'UPDATE users SET profile_image = ? WHERE id = ?';
    db.query(query, [profile_image, userId], (error, results) => {
        if (error) return res.status(500).json({ success: false, message: 'Internal Server Error' });
        if (results.affectedRows === 0) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

        res.status(200).json({ success: true, message: 'Foto profil berhasil diperbarui' });
    });
});
router.put('/profile', authMiddleware,(req, res) =>{
    const { first_name, last_name } = req.body;
    const userId = req.user.userId;
    const query = 'UPDATE users SET first_name = ?, last_name = ? WHERE id = ?';
db.query(query,[first_name, last_name, userId], (error, results)=>{
    if (results.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'User  tidak ditemukan' });
    }
    if (error) return res.status(500).json({ success: false, message: 'Internal Server Error' });
    // Mengambil data pengguna yang diperbarui
    const selectQuery = 'SELECT email, first_name, last_name, profile_image FROM users WHERE id = ?';
    db.query(selectQuery, [userId], (error, userResults) => {
        if (error) {
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
        // Memastikan pengguna ditemukan
        if (userResults.length === 0) {
            return res.status(404).json({ success: false, message: 'User  tidak ditemukan' });
        }
        // Mengembalikan respons dengan data pengguna yang diperbarui
        const updatedUser  = userResults[0];
        return res.status(200).json({
            message: 'Update Profile berhasil',
            data: {
                email: updatedUser .email,
                first_name: updatedUser .first_name,
                last_name: updatedUser .last_name,
                profile_image: updatedUser .profile_image
            }
        });
})

});
});
router.get('/profile', authMiddleware, (req, res) => {
    const userId = req.user.userId;
    const query = 'SELECT email, first_name, last_name, profile_image FROM users WHERE id = ?';;
    db.query(query, [userId], (error, results) => {
        if (error) return res.status(500).json({ success: false, message: 'Internal Server Error' });
        if (results.length === 0) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

        // Mengembalikan data profil pengguna
        const userProfile = results[0];
        res.status(200).json({
            success: true,
            message: 'Sukses',
            data: userProfile
        });
    });
});

module.exports = router;
