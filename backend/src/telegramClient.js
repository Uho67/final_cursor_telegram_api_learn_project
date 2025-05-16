const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const input = require('input');

class TelegramService {
  constructor() {
    this.client = null;
    this.apiId = parseInt(process.env.TELEGRAM_API_ID);
    this.apiHash = process.env.TELEGRAM_API_HASH;
    this.stringSession = new StringSession('');
  }

  async initialize() {
    try {
      this.client = new TelegramClient(this.stringSession, this.apiId, this.apiHash, {
        connectionRetries: 5,
      });

      await this.client.start({
        phoneNumber: async () => await input.text('Please enter your phone number: '),
        password: async () => await input.text('Please enter your password: '),
        phoneCode: async () => await input.text('Please enter the code you received: '),
        onError: (err) => console.log(err),
      });

      console.log('Telegram client initialized successfully');
      return this.client;
    } catch (error) {
      console.error('Failed to initialize Telegram client:', error);
      throw error;
    }
  }

  async getClient() {
    if (!this.client) {
      await this.initialize();
    }
    return this.client;
  }
}

module.exports = new TelegramService(); 