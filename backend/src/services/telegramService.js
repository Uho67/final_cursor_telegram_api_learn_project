const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { NewMessage } = require('telegram/events');
const { Api } = require('telegram/tl'); // low-level
const { Raw } = require('telegram/tl/custom');
const logger = require('../utils/logger');

class TelegramService {
  constructor() {
    this.client = null;
    this.apiId = process.env.TELEGRAM_API_ID;
    this.apiHash = process.env.TELEGRAM_API_HASH;
    this.session = new StringSession(process.env.TELEGRAM_SESSION || '');
    this.isInitialized = false;
    this.autoApproveEnabled = true; // Flag to control auto-approve feature
    this.currentUser = null;
    this.welcomeMessage = "Welcome {firstName}! Your join request has been automatically approved."; // Default welcome message
  }

  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    if (!this.client) {
      const error = new Error('Telegram client not initialized. Please check your credentials and try again.');
      logger.error(error);
      throw error;
    }
  }

  async initialize() {
    try {      
      if (!this.apiId || !this.apiHash) {
        const error = new Error('TELEGRAM_API_ID and TELEGRAM_API_HASH must be set in environment variables');
        logger.error(error);
        throw error;
      }

      if (!this.session) {
        const error = new Error('TELEGRAM_SESSION must be set in environment variables');
        logger.error(error);
        throw error;
      }

      this.client = new TelegramClient(
        this.session,
        parseInt(this.apiId),
        this.apiHash,
        {
          connectionRetries: 5,
        }
      );

      await this.client.connect();
      logger.info('Connected to Telegram successfully');

      if (!await this.client.isUserAuthorized()) {
        const error = new Error('User not authorized. Please run the login script first.');
        logger.error(error);
        throw error;
      }

    
      const me = await this.client.getMe();
      this.currentUser = me;

      // Set up event handlers
      logger.info('Setting up event handlers');
      await this.setupEventHandlers();
      
      this.isInitialized = true;
      logger.info('Telegram client initialization completed successfully');
      return me;
    } catch (error) {
      logger.error(error);
      this.client = null;
      this.isInitialized = false;
      throw error;
    }
  }

  async setupEventHandlers() {
    if (!this.client) return;
    
    // Handle all updates
    this.client.addEventHandler(async (update) => {
        try {
            // Check if it's a new join request update
            if (update instanceof Api.UpdatePendingJoinRequests) {
                logger.info('New join request update received');
                
                // Get the chat ID
                const chatId = update.peer.channelId.toString();
                logger.info(`New join request received for chat: ${chatId}`);

                // Get the input channel entity
                const inputChannel = await this.client.getInputEntity(update.peer);

                try {
                    // Approve all pending join requests at once
                    await this.client.invoke(
                        new Api.messages.HideAllChatJoinRequests({
                            peer: inputChannel,
                            approved: true
                        })
                    );
                    
                    logger.info(`Successfully approved all pending join requests for chat: ${chatId}`);
                } catch (error) {
                    logger.error(`Failed to approve all pending join requests for chat ${chatId}:`, error);
                }
            }
        } catch (error) {
            logger.error('Error processing update:', error);
        }
    });
  }

  formatWelcomeMessage(template, user) {
    return template
      .replace('{firstName}', user.firstName || '')
      .replace('{lastName}', user.lastName || '')
      .replace('{username}', user.username ? '@' + user.username : '')
      .replace('{id}', user.id.toString())
      .trim()
      .replace(/\s+/g, ' ');
  }

  async setWelcomeMessage(message) {
    if (!message || typeof message !== 'string') {
      throw new Error('Welcome message must be a non-empty string');
    }
    this.welcomeMessage = message;
    logger.log('INFO', 'Welcome message updated:', message);
    return this.welcomeMessage;
  }

  async getWelcomeMessage() {
    return this.welcomeMessage;
  }

  // Add methods to control auto-approve feature
  async enableAutoApprove() {
    this.autoApproveEnabled = true;
    logger.log('INFO', 'Auto-approve feature enabled');
  }

  async disableAutoApprove() {
    this.autoApproveEnabled = false;
    logger.log('INFO', 'Auto-approve feature disabled');
  }

  async getAutoApproveStatus() {
    return this.autoApproveEnabled;
  }

  async getChats(limit = 100) {
    try {
      await this.ensureInitialized();
      const chats = await this.client.getDialogs({
        limit: limit
      });
      return chats;
    } catch (error) {
      logger.error('Error getting chats:', error);
      throw new Error(`Failed to get chats: ${error.message}`);
    }
  }

  async getChatDetails(chatId) {
    try {
      await this.ensureInitialized();
      const chat = await this.client.getEntity(chatId);
      const participants = await this.client.getParticipants(chat, {
        limit: 100
      });

      return {
        id: chat.id.toString(),
        title: chat.title || chat.name || 'Unknown',
        type: chat.isGroup ? 'group' : chat.isChannel ? 'channel' : 'private',
        description: chat.about || '',
        memberCount: chat.participantsCount || participants.length,
        participants: participants.map(p => ({
          id: p.id.toString(),
          username: p.username,
          firstName: p.firstName,
          lastName: p.lastName
        })),
        photo: chat.photo ? {
          small: chat.photo.small,
          big: chat.photo.big
        } : null
      };
    } catch (error) {
      logger.error('Error getting chat details:', error);
      throw new Error(`Failed to get chat details: ${error.message}`);
    }
  }

  async getPendingJoinRequests(chatId) {
    try {
      await this.ensureInitialized();
      
      const inputChannel = await this.client.getInputEntity(chatId);
      
      // Get all pending join requests
      const pendingRequests = await this.client.invoke(
        new Api.channels.GetParticipants({
          channel: inputChannel,
          filter: new Api.ChannelParticipantsRecent(),
          offset: 0,
          limit: 100
        })
      );

      return pendingRequests.users.map(user => ({
        id: user.id.toString(),
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        accessHash: user.accessHash.toString()
      }));
    } catch (error) {
      logger.error('Error getting pending join requests:', error);
      throw new Error(`Failed to get pending join requests: ${error.message}`);
    }
  }

  async logout() {
    try {
      if (this.client) {
        await this.client.disconnect();
      }
      this.client = null;
      this.isInitialized = false;
    } catch (error) {
      logger.error('Error logging out:', error);
      throw new Error(`Failed to logout: ${error.message}`);
    }
  }
}

module.exports = new TelegramService(); 