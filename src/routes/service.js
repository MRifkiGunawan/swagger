const express = require('express');
const router = express.Router();
const db = require('../config/config'); // Pastikan jalur ini benar
const authMiddleware = require('../middleware/authMiddleware');

router.get('/services',authMiddleware, async (req, res) => {
  try {
      const query = `SELECT * FROM services`;
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
})

module.exports = router;