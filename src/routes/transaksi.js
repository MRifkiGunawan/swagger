const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../config/config'); // Pastikan db sudah dikonfigurasi untuk koneksi database


router.post('/transaction', authMiddleware, (req, res) => {
  const { service_code } = req.body;
  const userId = req.user.userId;

  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ message: 'Terjadi kesalahan pada server' });

    // Ambil informasi layanan berdasarkan service_code
    db.query('SELECT * FROM services WHERE service_code = ?', [service_code], (err, serviceResults) => {
      if (err) {
        db.rollback();
        return res.status(500).json({ message: 'Gagal mengambil informasi layanan' });
      }

      if (serviceResults.length === 0) {
        db.rollback();
        return res.status(404).json({ message: 'Layanan tidak ditemukan' });
      }

      const service = serviceResults[0];

      // Ambil saldo pengguna
      db.query('SELECT balance FROM users WHERE id = ?', [userId], (err, userResults) => {
        if (err) {
          db.rollback();
          return res.status(500).json({ message: 'Gagal mengambil saldo pengguna' });
        }

        const userBalance = userResults[0].balance;

        if (userBalance < service.service_tariff) {
          db.rollback();
          return res.status(400).json({ message: 'Saldo tidak mencukupi' });
        }

        // Update saldo pengguna
        db.query('UPDATE users SET balance = balance - ? WHERE id = ?', [service.service_tariff, userId], (err) => {
          if (err) {
            db.rollback();
            return res.status(500).json({ message: 'Gagal mengurangi saldo pengguna' });
          }

          // Buat transaksi pembayaran
          const invoiceNumber = `INV${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000)}`;
          const transaction = {
            user_id: userId,
            invoice_number: invoiceNumber,
            service_code: service.service_code,
            service_name: service.service_name,
            transaction_type: 'PAYMENT',
            total_amount: service.service_tariff,
            created_on: new Date(),
          };

          // Simpan transaksi ke tabel transactions
          db.query('INSERT INTO transactions SET ?', transaction, (err) => {
            if (err) {
              db.rollback();
              return res.status(500).json({ message: 'Gagal mencatat transaksi' });
            }

            // Simpan riwayat transaksi ke tabel transaction_history
            const transactionHistory = {
              user_id: transaction.user_id,
              invoice_number: transaction.invoice_number,
              transaction_type: transaction.transaction_type,
              description: transaction.transaction_type === 'TOPUP' ? 'Top Up balance' : service.service_name,
              total_amount: transaction.total_amount,
              created_on: transaction.created_on,
            };

            db.query('INSERT INTO transaction_history SET ?', transactionHistory, (err) => {
              if (err) {
                db.rollback();
                return res.status(500).json({ message: 'Gagal mencatat riwayat transaksi' });
              }

              // Commit transaksi jika semua berhasil
              db.commit((err) => {
                if (err) {
                  db.rollback();
                  return res.status(500).json({ message: 'Terjadi kesalahan saat commit transaksi' });
                }

                res.status(200).json({
                  status: 0,
                  message: 'Transaksi berhasil',
                  data: {
                    invoice_number: transaction.invoice_number,
                    service_code: transaction.service_code,
                    service_name: transaction.service_name,
                    transaction_type: transaction.transaction_type,
                    total_amount: transaction.total_amount,
                    created_on: transaction.created_on,
                  },
                });
              });
            });
          });
        });
      });
    });
  });
});


// router.get('/history', authMiddleware, (req, res) => {
//   const { offset = 0, limit = 10 } = req.query; // Set default offset and limit
//   const userId = req.user.userId; // Mengambil user_id dari payload JWT

//   const sql = `
//     SELECT 
//       invoice_number,
//       transaction_type,
//       description,
//       total_amount,
//       created_on
//     FROM 
//       transaction_history
//     WHERE 
//       user_id = ?
//     ORDER BY 
//       created_on DESC
//     LIMIT ?, ?
//   `;

//   db.query(sql, [userId, parseInt(offset), parseInt(limit)], (err, results) => {
//     if (err) {
//       return res.status(500).json({ status: 1, message: "Database query error" });
//     }

//     res.json({
//       status: 0,
//       message: "Get History Berhasil",
//       data: {
//         offset: parseInt(offset),
//         limit: parseInt(limit),
//         records: results.map(row => ({
//           invoice_number: row.invoice_number,
//           transaction_type: row.transaction_type,
//           description: row.description,
//           total_amount: row.total_amount,
//           created_on: row.created_on
//         }))
//       }
//     });
//   });
// });

router.get('/history', authMiddleware, (req, res) => {
  const userId = req.user.userId; // Mengambil user_id dari payload JWT
  const { offset = 0, limit = 10 } = req.query; // Set default pagination dengan offset 0 dan limit 10

  const sql = `
    SELECT 
      invoice_number,
      transaction_type,
      description,
      total_amount,
      created_on
    FROM 
      transaction_history
    WHERE 
      user_id = ?
    ORDER BY 
      created_on DESC
    LIMIT ?, ?
  `;

  db.query(sql, [userId, parseInt(offset), parseInt(limit)], (err, results) => {
    if (err) {
      return res.status(500).json({ status: 1, message: "Database query error" });
    }

    res.json({
      status: 0,
      message: "Get History Berhasil",
      data: {
        offset: parseInt(offset),
        limit: parseInt(limit),
        records: results.map(row => ({
          invoice_number: row.invoice_number,
          transaction_type: row.transaction_type,
          description: row.description,
          total_amount: row.total_amount,
          created_on: row.created_on
        }))
      }
    });
  });
});

module.exports = router;
 