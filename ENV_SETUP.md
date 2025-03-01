# Environment Setup

This project uses environment variables to store configuration and sensitive information. Follow these steps to set up your environment:

## Initial Setup

1. Copy the example environment file to create your own:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and replace the placeholder values with your actual API keys and configuration.

## Required Environment Variables

The application needs the following environment variables to be set correctly:

### AI API Keys
- `NUXT_OPENAI_KEY` - Your OpenAI API key
- `NUXT_CLAUDE_KEY` - Your Anthropic (Claude) API key
- `NUXT_GEMINI_API_KEY` - Your Google Gemini API key

### Service Configurations
- `NUXT_TWILIO_ACCOUNT_SID` - Twilio account SID for SMS functionality
- `NUXT_TWILIO_AUTH_TOKEN` - Twilio authentication token
- `NUXT_FIREBASE_*` - Firebase configuration parameters

## Security Notes

- **IMPORTANT**: Never commit your `.env` file to the repository
- Do not expose your API keys in client-side code
- Consider using a secrets management system for production environments
