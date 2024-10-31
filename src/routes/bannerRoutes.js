const express = require('express');
const router = express.Router();
const db = require('../config/config'); // Pastikan jalur ini benar

// Menambahkan banner baru
router.post('/banners', async (req, res) => {
    try {
        const { banner_name, banner_image,  description } = req.body;
console.log(req.body);
        if (!banner_name || !banner_image || ! description) {
            return res.status(400).json({ success: false, message: 'Data banner_name dan image_banner harus diisi' });
        }

        const query = 'INSERT INTO banner (banner_name, banner_image,  description) VALUES (?, ?, ?)';
        db.query(query, [banner_name, banner_image, description], (error, results) => {
            if (error) {
                console.error('Error inserting data to MySQL:', error);
                return res.status(500).json({ success: false, message: 'Internal Server Error' });
            }

            res.status(200).json({ success: true, message: 'Data berhasil ditambahkan', result: results });
        });
    } catch (err) {
        console.error('Error in POST /banners:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Mengambil semua banner
router.get('/banners', async (req, res) => {
    try {
        const query = 'SELECT * FROM banner';
        db.query(query, (err, result) => {  // Gantilah 'error' menjadi 'err'
            if (err) {  // Menggunakan 'err' di sini
                console.error('Error fetching data from MySQL:', err);
                return res.status(500).json({ success: false, message: 'Internal Server Error' });
            }
            res.status(200).json({ success: true, data: result });
        });
    } catch (error) {
       
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

module.exports = router; // Mengekspor router