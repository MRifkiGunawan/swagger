const express = require('express')
const app = express()
const port = 5000
const router = express.Router();
const bannerRoutes = require('./routes/bannerRoutes');
const registration = require('./routes/registrasi');
const login = require('./routes/login');
const profile = require('./routes/profil');
const services = require('./routes/service');
const transaction = require('./routes/transactions');
const transaksi = require('./routes/transaksi')
app.use(express.json());
app.use('/api', bannerRoutes);
app.use('/api',transaksi);
app.use('/api', registration);
app.use('/api', login);
app.use('/api', profile);
app.use('/api', services);
app.use('/api', transaction);
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Server berjalan pada http://localhost:${port}`)
})
