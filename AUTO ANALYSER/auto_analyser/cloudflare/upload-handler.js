// Load environment variables from .env file
require('dotenv').config();

const fetch = require('node-fetch');
const fs = require('fs');
const FormData = require('form-data');
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '../../../')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 1000 * 1024 * 1024 } // 1GB max file size
});

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Access Cloudflare API token from environment variables
const apiToken = process.env.CLOUDFLARE_API_TOKEN;
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

// Check if API token and account ID are available
if (!apiToken || !accountId) {
  console.error('Error: Cloudflare API token or account ID not found in .env file');
  console.error('Please make sure you have created a .env file with your API credentials');
  process.exit(1);
}

// Simple function to make Cloudflare API requests
async function callCloudflareApi(endpoint, options = {}) {
  const url = `https://api.cloudflare.com/client/v4${endpoint}`;
  const headers = {
    'Authorization': `Bearer ${apiToken}`,
    'Content-Type': 'application/json',
    ...options.headers
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    return await response.json();
  } catch (error) {
    console.error(`Error calling Cloudflare API: ${error.message}`);
    throw error;
  }
}

// Get a direct upload URL from Cloudflare Stream
async function getUploadUrl() {
  const result = await callCloudflareApi(`/accounts/${accountId}/stream/direct_upload`, {
    method: 'POST',
    body: JSON.stringify({
      maxDurationSeconds: 3600, // 1 hour max
      expiry: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour from now
    })
  });
  
  if (!result.success) {
    throw new Error(`Failed to get upload URL: ${JSON.stringify(result.errors)}`);
  }
  
  return result.result;
}

// Upload a video to Cloudflare Stream using the direct upload URL
async function uploadVideoToCloudflare(filePath, uploadUrl) {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));
  
  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: form
  });
  
  return await response.json();
}

// Get video details from Cloudflare Stream
async function getVideoDetails(videoId) {
  const result = await callCloudflareApi(`/accounts/${accountId}/stream/${videoId}`);
  
  if (!result.success) {
    throw new Error(`Failed to get video details: ${JSON.stringify(result.errors)}`);
  }
  
  return result.result;
}

// Store video metadata and timestamps in a JSON file
function storeMetadata(videoId, metadata) {
  const dataDir = path.join(__dirname, 'data');
  
  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }
  
  const filePath = path.join(dataDir, `${videoId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2));
  
  return filePath;
}

// API endpoint to upload a video to Cloudflare Stream
app.post('/api/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No video file provided' });
    }
    
    // Get metadata from request body
    const metadata = req.body;
    
    // Get direct upload URL from Cloudflare Stream
    console.log('Getting direct upload URL from Cloudflare Stream...');
    const uploadUrlData = await getUploadUrl();
    
    // Upload video to Cloudflare Stream
    console.log('Uploading video to Cloudflare Stream...');
    const uploadResult = await uploadVideoToCloudflare(req.file.path, uploadUrlData.uploadURL);
    
    if (!uploadResult.success) {
      throw new Error(`Upload failed: ${JSON.stringify(uploadResult.errors)}`);
    }
    
    // Get video ID from upload result
    const videoId = uploadResult.result.uid;
    
    // Get video details from Cloudflare Stream
    console.log('Getting video details from Cloudflare Stream...');
    const videoDetails = await getVideoDetails(videoId);
    
    // Store metadata and timestamps
    console.log('Storing metadata and timestamps...');
    const metadataWithVideo = {
      ...metadata,
      videoId,
      videoDetails,
      uploadedAt: new Date().toISOString()
    };
    
    const metadataPath = storeMetadata(videoId, metadataWithVideo);
    console.log(`Metadata stored at ${metadataPath}`);
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    
    // Return success response with video ID
    res.json({
      success: true,
      videoId,
      playbackUrl: `https://customer-${videoDetails.creator.customerCode}.cloudflarestream.com/${videoId}/manifest/video.m3u8`,
      thumbnailUrl: `https://customer-${videoDetails.creator.customerCode}.cloudflarestream.com/${videoId}/thumbnails/thumbnail.jpg`,
      metadata: metadataWithVideo
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API endpoint to get all videos
app.get('/api/videos', (req, res) => {
  try {
    const dataDir = path.join(__dirname, 'data');
    
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
      return res.json({ success: true, videos: [] });
    }
    
    // Read all JSON files in data directory
    const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));
    const videos = files.map(file => {
      const filePath = path.join(dataDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContent);
    });
    
    res.json({ success: true, videos });
  } catch (error) {
    console.error('Error getting videos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API endpoint to get a specific video
app.get('/api/videos/:videoId', (req, res) => {
  try {
    const videoId = req.params.videoId;
    const filePath = path.join(__dirname, 'data', `${videoId}.json`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const video = JSON.parse(fileContent);
    
    res.json({ success: true, video });
  } catch (error) {
    console.error('Error getting video:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Upload endpoint: http://localhost:${port}/api/upload`);
  console.log(`Videos endpoint: http://localhost:${port}/api/videos`);
});
