const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { NewMessage } = require('telegram/events');
const { Api } = require('telegram/tl');
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
    
      // Get current user info once during setup
      this.currentUser = await this.client.getMe();
      // Handle all updates
      this.client.addEventHandler(async (update) => {
        try {
          if (update.className === "UpdatePendingJoinRequests") {
         
            const inputChannel = await this.client.getInputEntity(update.peer);
              // 2. Идём по каждому пользователю из recentRequesters
              for (const requester of update.recentRequesters) {
                const userIdStr = requester.value.toString();
                const userEntity = update._entities.get(userIdStr);
              
                if (!userEntity) {
                  console.warn("No entity for user ID:", userIdStr);
                  continue;
                }
              
                const inputUser = new Api.InputUser({
                  userId: BigInt(userEntity.id),
                  accessHash: BigInt(userEntity.accessHash.value),
                });
              
                // 3. Одобряем запрос
                await this.client.invoke(
                  new Api.messages.HideChatJoinRequest({
                    peer: inputChannel,
                    approved: true,
                    userId: inputUser
                  })
                );
                console.log(`Approved: ${userEntity.username || userEntity.id}`);
              }
          }
        } catch (error) {
          logger.error(error.message);
        }
      });
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