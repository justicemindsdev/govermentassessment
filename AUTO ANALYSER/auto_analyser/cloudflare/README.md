# Cloudflare API Project

This project demonstrates how to use the Cloudflare API while keeping your API credentials private when sharing your codebase.

## How It Works

This project uses environment variables to store sensitive API credentials. The `.env` file containing these credentials is excluded from version control using `.gitignore`, ensuring your API key remains private when sharing your code.

## Setup

1. Clone or download this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with your Cloudflare API credentials:
   ```
   CLOUDFLARE_API_TOKEN=your_api_token_here
   ```
4. Run the example:
   ```
   npm start
   ```

## Keeping Your API Key Private

The key components that keep your API credentials private are:

### 1. `.env` File

This file stores your API credentials as environment variables:

```
CLOUDFLARE_API_TOKEN=your_api_token_here
```

### 2. `.gitignore` File

This file tells Git to ignore the `.env` file, ensuring your credentials are not committed to version control:

```
# Ignore environment variables file containing API credentials
.env
```

### 3. Loading Environment Variables in Code

The code uses the `dotenv` package to load environment variables from the `.env` file:

```javascript
require('dotenv').config();
const apiToken = process.env.CLOUDFLARE_API_TOKEN;
```

## Sharing Your Code

When sharing your code (e.g., pushing to GitHub, sending to colleagues):

1. The `.env` file will be automatically excluded due to the `.gitignore` configuration
2. Recipients of your code will need to create their own `.env` file with their credentials
3. You can include a sample `.env.example` file (without real credentials) to show the required format

## Extending This Project

You can extend this project by:

1. Adding more Cloudflare API endpoints to the code
2. Creating a more comprehensive API client
3. Building a user interface around these API calls

## Security Best Practices

- Never hardcode API keys directly in your source code
- Never commit `.env` files to version control
- Regularly rotate your API keys for better security
- Use the principle of least privilege when creating API tokens
