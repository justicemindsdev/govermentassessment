require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const FormData = require('form-data');
const fetch = require('node-fetch');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Cloudflare API configuration
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CF_API_TOKEN;
const CF_STREAM_URL = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/stream`;

// Validate environment variables
if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
  console.error('Missing Cloudflare environment variables');
  process.exit(1);
}

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  optionsSuccessStatus: 200
}));

// Upload endpoint
app.post('/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    const response = await fetch(CF_STREAM_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CF_API_TOKEN}`,
        ...form.getHeaders()
      },
      body: form
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Cloudflare API Error:', data);
      return res.status(500).json({ 
        error: 'Video processing failed',
        details: data.errors 
      });
    }

    res.json({
      streamId: data.result.uid,
      preview: data.result.preview,
      duration: data.result.duration,
      meta: data.result.meta
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Upload server running on port ${PORT}`);
});
