// Load environment variables from .env file
require('dotenv').config();

const fetch = require('node-fetch');

// Access Cloudflare API token from environment variables
const apiToken = process.env.CLOUDFLARE_API_TOKEN;

// Check if API token is available
if (!apiToken) {
  console.error('Error: Cloudflare API token not found in .env file');
  console.error('Please make sure you have created a .env file with your API token');
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

// Example: Verify API token
async function verifyApiToken() {
  const result = await callCloudflareApi('/user/tokens/verify');
  return result;
}

// Example: List zones (domains)
async function listZones() {
  const result = await callCloudflareApi('/zones');
  return result;
}

// Main function
async function main() {
  try {
    // Verify API token
    console.log('Verifying API token...');
    const tokenVerification = await verifyApiToken();
    
    if (tokenVerification.success) {
      console.log('API token is valid!');
      
      // List zones
      console.log('\nFetching zones...');
      const zonesResult = await listZones();
      
      if (zonesResult.success) {
        console.log(`Found ${zonesResult.result.length} zones:`);
        zonesResult.result.forEach(zone => {
          console.log(`- ${zone.name} (ID: ${zone.id})`);
        });
      } else {
        console.error('Failed to fetch zones:', zonesResult.errors);
      }
    } else {
      console.error('API token verification failed:', tokenVerification.errors);
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

// Run the main function
main();
