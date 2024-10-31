var mysql = require('mysql');

// Konfigurasi koneksi ke MySQL
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',       
  password: 'tigaroda'    
});

// Koneksi ke MySQL
connection.connect(function(err) {
  if (err) throw err;
  // console.log("Connected!");

  // Buat database jika belum ada
  connection.query("CREATE DATABASE IF NOT EXISTS swagger", (err, result) => {
    if (err) throw err;
    // console.log("Database sudah dibuat");

    // Pilih database swagger
    connection.query("USE swagger", (err, result) => {
      if (err) throw err;

      // Buat tabel banner jika belum ada
      const createBannerTableQuery = `
        CREATE TABLE IF NOT EXISTS banner (
          id INT AUTO_INCREMENT PRIMARY KEY,
          banner_name VARCHAR(255) NOT NULL,
          banner_image VARCHAR(255) NOT NULL,
          description TEXT
        );
      `;

      connection.query(createBannerTableQuery, (err, result) => {
        if (err) throw err;
        console.log("Tabel banner sudah dibuat");

        // Buat tabel users jika belum ada
        const createUserTableQuery = `
          CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            first_name VARCHAR(255) NOT NULL,
            last_name VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            profile_image VARCHAR(255) DEFAULT NULL,
            balance DECIMAL(10, 2) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `;

        connection.query(createUserTableQuery, (err, result) => {
          if (err) throw err;
          console.log("Tabel users sudah dibuat");

          const createServiceTableQuery =
          `CREATE TABLE IF NOT EXISTS services (
            id INT AUTO_INCREMENT PRIMARY KEY,
            service_code VARCHAR(50) NOT NULL,
            service_name VARCHAR(100) NOT NULL,
            service_icon VARCHAR(255) NOT NULL,
            service_tariff DECIMAL(15, 2) NOT NULL
        );`;
          connection.query(createServiceTableQuery,(err, result)=>{
            if (err) throw err;
            // console.log("Tabel service sudah dibuat");
           
            const services = [
              { service_code: 'PAJAK', service_name: 'Pajak PBB', service_icon: 'https://nutech-integrasi.app/dummy.jpg', service_tariff: 40000 },
              { service_code: 'PLN', service_name: 'Listrik', service_icon: 'https://nutech-integrasi.app/dummy.jpg', service_tariff: 10000 },
              { service_code: 'PDAM', service_name: 'PDAM Berlangganan', service_icon: 'https://nutech-integrasi.app/dummy.jpg', service_tariff: 40000 },
              { service_code: 'PULSA', service_name: 'Pulsa', service_icon: 'https://nutech-integrasi.app/dummy.jpg', service_tariff: 40000 },
              { service_code: 'PGN', service_name: 'PGN Berlangganan', service_icon: 'https://nutech-integrasi.app/dummy.jpg', service_tariff: 50000 },
              { service_code: 'MUSIK', service_name: 'Musik Berlangganan', service_icon: 'https://nutech-integrasi.app/dummy.jpg', service_tariff: 50000 },
              { service_code: 'TV', service_name: 'TV Berlangganan', service_icon: 'https://nutech-integrasi.app/dummy.jpg', service_tariff: 50000 },
              { service_code: 'PAKET_DATA', service_name: 'Paket data', service_icon: 'https://nutech-integrasi.app/dummy.jpg', service_tariff: 50000 },
              { service_code: 'VOUCHER_GAME', service_name: 'Voucher Game', service_icon: 'https://nutech-integrasi.app/dummy.jpg', service_tariff: 100000 },
              { service_code: 'VOUCHER_MAKANAN', service_name: 'Voucher Makanan', service_icon: 'https://nutech-integrasi.app/dummy.jpg', service_tariff: 100000 },
              { service_code: 'QURBAN', service_name: 'Qurban', service_icon: 'https://nutech-integrasi.app/dummy.jpg', service_tariff: 200000 },
              { service_code: 'ZAKAT', service_name: 'Zakat', service_icon: 'https://nutech-integrasi.app/dummy.jpg', service_tariff: 300000 }
            ];
            
            services.forEach((service) => {
              const insertServiceQuery = 'INSERT INTO services (service_code, service_name, service_icon, service_tariff) VALUES (?, ?, ?, ?)';
              connection.query(insertServiceQuery, [service.service_code, service.service_name, service.service_icon, service.service_tariff], (err, result) => {
                if (err) throw err;
                // console.log(`Layanan ${service.service_name} berhasil dimasukkan`);
              });
            });
             
      const createTransactionsTableQuery = 
        `CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        invoice_number VARCHAR(255) NOT NULL UNIQUE,
        service_code VARCHAR(50) NOT NULL,
        service_name VARCHAR(255) NOT NULL,
        transaction_type ENUM('TOPUP', 'PAYMENT') NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );`;
            connection.query(createTransactionsTableQuery,(err, result)=>{})
            // console.log("Tabel transaction sudah dibuat")
            const createTransactionsHistoryTableQuery = 
        `CREATE TABLE IF NOT EXISTS transaction_history (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          invoice_number VARCHAR(255) NOT NULL UNIQUE,
          transaction_type ENUM('TOPUP', 'PAYMENT') NOT NULL,
          description VARCHAR(255) NOT NULL,
          total_amount DECIMAL(10, 2) NOT NULL,
          created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );`;
            connection.query(createTransactionsHistoryTableQuery,(err, result)=>{})
            console.log("Tabel transaction history sudah dibuat")
          })
        });

      });
    });
  });
});

module.exports = connection;