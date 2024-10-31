const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../config/config'); // Pastikan db sudah dikonfigurasi untuk koneksi database

router.post('/topup', authMiddleware, (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.userId;

    // Validasi input amount
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ message:  "Paramter amount hanya boleh angka dan tidak boleh lebih kecil dari 0", data: null });
    }

    // Mulai transaksi untuk memastikan konsistensi
    db.beginTransaction((err) => {
      if (err) return res.status(500).json({ message: 'Terjadi kesalahan pada server' });

      // Ambil saldo pengguna saat ini
      db.query('SELECT balance FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) {
          db.rollback();
          return res.status(500).json({ message: 'Gagal mengambil saldo pengguna' });
        }

        const currentBalance = results[0].balance;
        const newBalance = currentBalance + amount;

        // Update saldo pengguna
        db.query('UPDATE users SET balance = ? WHERE id = ?', [newBalance, userId], (err) => {
          if (err) {
            db.rollback();
            return res.status(500).json({ message: 'Gagal memperbarui saldo pengguna' });
          }

          // Generate nomor invoice
          const invoiceNumber = `INV${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000)}`;

          // Buat transaksi top-up
          const transaction = {
            user_id: userId,
            invoice_number: invoiceNumber,
            service_code: 'TOPUP',
            service_name: 'Top-Up Saldo',
            transaction_type: 'TOPUP',
            total_amount: amount,
            created_on: new Date(),
          };

          // Simpan transaksi ke dalam tabel transactions
          db.query('INSERT INTO transactions SET ?', transaction, (err) => {
            if (err) {
              db.rollback();
              return res.status(500).json({ message: 'Gagal mencatat transaksi' });
            }

            // Commit transaksi jika semuanya berhasil
            db.commit((err) => {
              if (err) {
                db.rollback();
                return res.status(500).json({ message: 'Terjadi kesalahan saat commit transaksi' });
              }

              // Respons JSON untuk transaksi yang berhasil
              res.status(200).json({
                status: 0,
                message: 'Transaksi berhasil',
                data: {
                  total_amount: transaction.total_amount,
                },
              });
            });
          });
        });
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});
router.get('/balance', authMiddleware, (req, res) => {
  try {
    const userId = req.user.userId; // Ambil userId dari JWT payload

    // Ambil balance dari database berdasarkan userId
    db.query('SELECT balance FROM users WHERE id = ?', [userId], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'User tidak ditemukan' });
      }

      // Ambil balance dari hasil query dan kirim respons
      const balance = results[0].balance;
      res.status(200).json({
        status: 0,
        message: 'Get Balance Berhasil',
        data: {
          balance: balance,
        },
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

module.exports = router;
