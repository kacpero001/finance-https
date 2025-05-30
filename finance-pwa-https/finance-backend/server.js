const express = require('express');
const mongoose = require('mongoose');
const webpush = require('web-push');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('sw.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Połączono z MongoDB'))
  .catch(err => console.error('Błąd połączenia z MongoDB:', err));

const transactionSchema = new mongoose.Schema({
  id: Number,
  description: String,
  amount: Number,
  type: String
});
const Transaction = mongoose.model('Transaction', transactionSchema);

const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
};
webpush.setVapidDetails('mailto:example@yourdomain.com', vapidKeys.publicKey, vapidKeys.privateKey);

app.post('/api/transactions', async (req, res) => {
  const transaction = new Transaction(req.body);
  await transaction.save();
  res.json(transaction);
});

app.delete('/api/transactions', async (req, res) => {
  await Transaction.deleteMany({});
  res.json({ message: 'Wszystkie dane zostały usunięte' });
});

app.post('/api/subscribe', async (req, res) => {
  res.status(201).json({});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));
