# Telegram User Bot Project

This project consists of a backend service built with Node.js, Express, and SQLite, and a frontend application built with Vue 3 and Vite.

## Project Structure

```
├── backend/                     # Node.js + Express + SQLite
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── middlewares/        # Express middlewares
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Utility functions
│   │   ├── database.js        # Database configuration
│   │   ├── telegramClient.js  # Telegram API wrapper
│   │   └── app.js            # Express application
│   └── .env                   # Environment variables
│   └── package.json
│
├── frontend/                   # Vue 3 + Vite
│   ├── src/
│   │   ├── components/        # Vue components
│   │   ├── views/            # Page components
│   │   ├── router/           # Vue Router configuration
│   │   ├── store/            # Vuex store
│   │   ├── App.vue           # Root component
│   │   └── main.js           # Application entry point
│   └── vite.config.js
│   └── package.json
```

## Setup Instructions

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your configuration
4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:
```
PORT=3000
TELEGRAM_API_ID=your_api_id
TELEGRAM_API_HASH=your_api_hash
DATABASE_URL=sqlite://./database.sqlite
``` 