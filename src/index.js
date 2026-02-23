// index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// AUTH ROUTES ONLY
const authRoutes = require('./routes/authRoutes');
const usdtRoutes = require('./routes/usdtRoutes');
const walletRoutes = require('./routes/walletRoutes');
const paystackRoutes = require("./routes/paystackRoutes");
const korapayRoutes = require("./routes/korapayRoutes");
const flutterwaveRoutes = require("./routes/flutterwaveRoutes");
const smspoolRoutes = require("./routes/smspoolRoutes");
const transactionRoutes = require("./routes/transactionsRoutes");

const app = express();

// Trust proxy (safe to keep)
app.set('trust proxy', 1);

// ================= CORS ==================
const allowedOrigins = [
  'http://localhost:3000',
  'https://realsms.vercel.app',
  'https://www.realsms.store',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS blocked'));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ============== BODY PARSER ==============
app.use(express.json());

// ============== ROOT =====================
app.get('/', (req, res) => {
  res.json({ message: 'RealSMS API is running 🚀' });
});

// ================= ROUTES =================
app.use('/api/auth', authRoutes);
app.use('/api/usdt', usdtRoutes); 
app.use('/api/wallet', walletRoutes);
app.use("/api/paystack", paystackRoutes); 
app.use("/api/korapay", korapayRoutes);
app.use("/api/flutterwave", flutterwaveRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/smspool", smspoolRoutes);

// ================= MONGODB =================
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) =>
    console.error('❌ MongoDB Connection Error:', err.message)
  );

// Auto-reconnect
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected... reconnecting');
  mongoose.connect(process.env.MONGODB_URI);
});

// ============== ERROR HANDLER =============
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.message);
  res.status(500).json({
    error: 'Something went wrong',
    details: err.message,
  });
});

// ============== START SERVER ==============
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});






















