# Ben Mak Claim Substantiation Tool

A comprehensive tool for documenting and analyzing Ben Mak's expertise with video evidence.

## Overview

This application provides a platform for documenting and analyzing Ben Mak's expertise as demonstrated in meetings and interactions. It allows users to:

1. View existing evidence with video clips, transcripts, and analysis
2. Upload new videos and transcripts to Cloudflare for persistence
3. Add timestamps, evidence points, and tags to highlight specific moments

## Features

- **Evidence Dashboard**: View categorized claims with video evidence
- **Video Player**: Watch video clips with synchronized transcript highlighting
- **Search Functionality**: Search for specific claims or evidence
- **Upload System**: Upload new videos and transcripts to Cloudflare Stream
- **Responsive Design**: Works on desktop and mobile devices

## Setup Instructions

### 1. Basic Setup

To run the basic application (viewing existing evidence):

1. Clone this repository
2. Open `index.html` in a web browser

### 2. Cloudflare Integration Setup (for uploading new videos)

To enable the video upload functionality, you need to set up the Cloudflare API integration:

1. **Create a Cloudflare Account**:
   - Sign up at [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up) if you don't have an account
   - Note your Account ID from the dashboard URL: `https://dash.cloudflare.com/ACCOUNT_ID`

2. **Create an API Token**:
   - Go to [https://dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
   - Click "Create Token"
   - Use the "Create Custom Token" option
   - Give it a name (e.g., "Ben Mak Evidence Tool")
   - Under "Permissions", add:
     - Account > Stream > Edit
     - Account > Account Settings > Read
   - Under "Account Resources", select your account
   - Click "Continue to summary" and then "Create Token"
   - **Important**: Copy the token immediately as it won't be shown again

3. **Configure the Upload Server**:
   - Navigate to the Cloudflare directory: `cd AUTO\ ANALYSER/auto_analyser/cloudflare/`
   - Copy the example environment file: `cp .env.example .env`
   - Edit the `.env` file and add your Cloudflare credentials:
     ```
     CLOUDFLARE_API_TOKEN=your_api_token_here
     CLOUDFLARE_ACCOUNT_ID=your_account_id_here
     PORT=3000
     ```

4. **Install Dependencies**:
   - Make sure you have Node.js installed (v14 or higher)
   - Run: `npm install`

5. **Start the Upload Server**:
   - Run: `npm run upload-server`
   - The server will start on port 3000 (or the port specified in your .env file)

## Usage

### Viewing Evidence

1. Open `index.html` in a web browser
2. Browse through the categories in the sidebar
3. Click on any timestamp to view the video evidence
4. Use the search box to find specific claims or evidence

### Uploading New Evidence

1. Start the upload server (see setup instructions above)
2. Open `index.html` in a web browser
3. Click on "Upload New Evidence" in the navigation
4. Fill out the form with:
   - Video file (MP4, MOV, or WebM)
   - Title and description
   - Framework and evidence level
   - Timestamps and transcripts
5. Click "Upload to Cloudflare" to upload the video and metadata
6. Once uploaded, the video will be available in the evidence dashboard

## Technical Details

### Architecture

- **Frontend**: HTML, CSS, and JavaScript
- **Video Streaming**: Cloudflare Stream with HLS.js for playback
- **Upload Server**: Node.js with Express
- **API Integration**: Cloudflare Stream API

### File Structure

- `index.html`: Main evidence dashboard
- `upload.html`: Upload form for new evidence
- `AUTO ANALYSER/auto_analyser/cloudflare/`: Cloudflare API integration
  - `upload-handler.js`: Node.js server for handling uploads
  - `package.json`: Dependencies and scripts
  - `.env.example`: Example environment variables

## Troubleshooting

### Video Upload Issues

- **Upload fails**: Check your Cloudflare API token permissions
- **Server won't start**: Make sure you've created the `.env` file with correct credentials
- **CORS errors**: The upload server must be running on the same domain as the frontend or have CORS enabled

### Video Playback Issues

- **Video doesn't play**: Make sure your browser supports HLS (most modern browsers do)
- **Transcript doesn't highlight**: Check the browser console for errors

## Contributing

To contribute to this project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.
