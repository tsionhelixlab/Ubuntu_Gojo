require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./src/routes');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api', apiRoutes);
app.use(express.static(path.join(__dirname, 'frontend')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'frontend', 'Landing.html')));
app.use('/api', (req, res) => res.status(404).json({ success:false, message:'API route not found' }));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Ubuntu Gojo running at http://localhost:${PORT}`));
