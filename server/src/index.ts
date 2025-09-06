// src/index.ts
import express = require('express');
import cors = require('cors');
const dotenv = require('dotenv');
import adminRoutes from './api/admin/admin.routes';
import userRoutes from './api/users/users.routes';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.send('Web3Bombers API is alive! 🚀');
});

// Use the admin routes
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});