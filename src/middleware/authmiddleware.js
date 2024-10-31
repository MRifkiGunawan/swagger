// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'Kunci-rahasia124';

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: 'Akses ditolak, token tidak ada' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Simpan data user ke request untuk digunakan nanti
        next(); // Lanjut ke route berikutnya
    } catch (error) {
        return res.status(403).json({ success: false, message: 'Token tidak valid' });
    }
};

module.exports = authMiddleware;
