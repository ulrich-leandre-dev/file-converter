const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

const app = express();
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuration multer pour upload
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max
});

// Créer les dossiers nécessaires
async function initDirectories() {
  await fs.mkdir('./uploads', { recursive: true });
  await fs.mkdir('./converted', { recursive: true });
}

initDirectories();

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'File Converter API is running' });
});

// Route pour créer une session de paiement Paystack
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { email } = req.body;
    
    const response = await axios.post('https://api.paystack.co/transaction/initialize', {
      email: email || 'customer@example.com',
      amount: 65000, // ~1€ en FCFA (Paystack utilise les kobo/centimes, donc 650.00 XOF)
      currency: 'XOF',
      callback_url: `${process.env.CLIENT_URL}/success`,
      metadata: {
        custom_fields: [
          {
            display_name: "Service",
            variable_name: "service",
            value: "File Conversion"
          }
        ]
      }
    }, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({ 
      authorization_url: response.data.data.authorization_url,
      reference: response.data.data.reference 
    });
  } catch (error) {
    console.error('Paystack error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.message });
  }
});

// Route pour vérifier le paiement Paystack
app.get('/api/verify-payment/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
      }
    });

    res.json({ 
      paid: response.data.data.status === 'success',
      reference: response.data.data.reference 
    });
  } catch (error) {
    console.error('Paystack verify error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.message });
  }
});

// Route pour convertir un fichier
app.post('/api/convert', upload.single('file'), async (req, res) => {
  try {
    const { paymentReference, targetFormat } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier uploadé' });
    }

    // Vérifier le paiement Paystack
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${paymentReference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
      }
    });

    if (response.data.data.status !== 'success') {
      return res.status(403).json({ error: 'Paiement non vérifié' });
    }

    // Logique de conversion
    const inputPath = req.file.path;
    const outputFilename = `converted-${Date.now()}.${targetFormat}`;
    const outputPath = path.join('./converted', outputFilename);

    const converter = require('./converters');
    await converter.convert(inputPath, outputPath, targetFormat);

    res.download(outputPath, async (err) => {
      await fs.unlink(inputPath).catch(() => {});
      await fs.unlink(outputPath).catch(() => {});
    });

  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ error: 'Erreur lors de la conversion' });
  }
});

// Formats supportés
app.get('/api/formats', (req, res) => {
  res.json({
    images: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'tiff', 'svg'],
    documents: ['pdf', 'docx', 'txt', 'html', 'md'],
    audio: ['mp3', 'wav', 'ogg', 'flac', 'm4a'],
    video: ['mp4', 'avi', 'mkv', 'mov', 'webm']
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
