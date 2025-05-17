# Telegram User Bot Backend

This backend service provides a Telegram user bot with various features including automatic join request approval.

## Setup

1. **Environment Variables**
   Create a `.env` file in the backend directory with the following variables:
   ```
   TELEGRAM_API_ID=your_api_id
   TELEGRAM_API_HASH=your_api_hash
   TELEGRAM_SESSION=your_session_string
   ```

2. **Get API Credentials**
   - Go to https://my.telegram.org/auth
   - Log in with your phone number
   - Go to "API development tools"
   - Create a new application
   - You'll receive an `api_id` and `api_hash`

3. **Initial Login**
   Run the login script to get your session string:
   ```bash
   node src/scripts/login.js
   ```
   Follow the prompts to:
   - Enter your phone number
   - Enter the verification code sent to your Telegram
   - Enter your 2FA password (if enabled)
   
   Copy the session string output and add it to your `.env` file as `TELEGRAM_SESSION`

4. **Install Dependencies**
   ```bash
   npm install
   ```

5. **Start the Server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Chat Management

#### Get All Chats
```http
GET /api/telegram/chats
```
Returns a list of all chats with basic information.

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "123456789",
      "title": "Chat Name",
      "type": "private|group|channel",
      "unreadCount": 5,
      "lastMessage": {
        "id": "987654321",
        "text": "Last message text",
        "date": "2024-01-20T12:00:00Z"
      }
    }
  ]
}
```

#### Get Chat Details
```http
GET /api/telegram/chats/:chatId
```
Returns detailed information about a specific chat.

Response:
```json
{
  "success": true,
  "data": {
    "id": "123456789",
    "title": "Chat Name",
    "type": "private|group|channel",
    "description": "Chat description",
    "memberCount": 100,
    "participants": [
      {
        "id": "123456789",
        "username": "user1",
        "firstName": "John",
        "lastName": "Doe"
      }
    ],
    "photo": {
      "small": "photo_small_url",
      "big": "photo_big_url"
    }
  }
}
```

### Auto-approve Feature

#### Enable Auto-approve
```http
POST /api/telegram/auto-approve/enable
```
Enables automatic approval of join requests in chats where the user is an admin.

Response:
```json
{
  "success": true,
  "message": "Auto-approve feature enabled"
}
```

#### Disable Auto-approve
```http
POST /api/telegram/auto-approve/disable
```
Disables automatic approval of join requests.

Response:
```json
{
  "success": true,
  "message": "Auto-approve feature disabled"
}
```

#### Get Auto-approve Status
```http
GET /api/telegram/auto-approve/status
```
Returns the current status of the auto-approve feature.

Response:
```json
{
  "success": true,
  "data": {
    "enabled": true
  }
}
```

## Error Handling

All endpoints return appropriate error responses with the following structure:
```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message",
  "details": "Additional error information (if available)"
}
```

Common error types:
- `Telegram client not initialized` - When the Telegram client hasn't been properly initialized
- `Not authorized` - When the user hasn't been authorized
- `Failed to fetch chats` - When there's an error fetching chat information

## Security Notes

1. Keep your `api_id`, `api_hash`, and session string secure
2. Never share your session string as it provides access to your account
3. The session string is stored in the `.env` file and should not be committed to version control
4. User bots are subject to Telegram's terms of service, so use responsibly

## Development

To run the server in development mode with auto-reload:
```bash
npm run dev
```

## Additional Changes

1. Added additional check for join request updates:
```javascript
this.client.addEventHandler(async (update) => {
  if (update instanceof Api.UpdateChannelParticipant) {
    console.log('Join request update:', {
      channelId: update.channelId,
      userId: update.userId,
      newParticipant: update.newParticipant
    });
  }
}); 