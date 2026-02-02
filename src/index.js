// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import dotenv from "dotenv";
// import authRoutes from "./routes/auth.js";

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
// app.use(express.json()); // parse JSON

// // Routes
// app.use("/api", authRoutes);

// // Connect to MongoDB
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.error("MongoDB connection error:", err));

// // Start server
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// AUTH ROUTES ONLY
const authRoutes = require('./routes/authRoutes');

const app = express();

// Trust proxy (safe to keep)
app.set('trust proxy', 1);

// ================= CORS ==================
const allowedOrigins = [
  'http://localhost:3000',
  'https://realsms.vercel.app',
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
  res.json({ message: 'Auth API is running 🚀' });
});

// ================= ROUTES =================
app.use('/api/auth', authRoutes);

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

