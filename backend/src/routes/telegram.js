const express = require('express');
const router = express.Router();
const telegramService = require('../services/telegramService');

// Get all chats for the current user
router.get('/chats', async (req, res) => {
  try {
    const chats = await telegramService.getChats();
    
    // Transform the chat data to a more API-friendly format
    const formattedChats = chats.map(chat => ({
      id: chat.id.toString(),
      title: chat.title || chat.name || 'Unknown',
      type: chat.isGroup ? 'group' : chat.isChannel ? 'channel' : 'private',
      unreadCount: chat.unreadCount,
      lastMessage: chat.message ? {
        id: chat.message.id,
        text: chat.message.text,
        date: chat.message.date
      } : null
    }));

    res.json({
      success: true,
      data: formattedChats
    });
  } catch (error) {
    console.error('Error fetching chats:', error);
    
    // Check for specific error types
    if (error.message.includes('not initialized')) {
      return res.status(401).json({
        success: false,
        error: 'Telegram client not initialized',
        message: 'Please ensure you have set up your Telegram credentials and run the login script first.',
        details: error.message
      });
    }
    
    if (error.message.includes('not authorized')) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized',
        message: 'Please run the login script to authorize your account.',
        details: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch chats',
      message: error.message,
      details: error.stack
    });
  }
});

// Get detailed information about a specific chat
router.get('/chats/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await telegramService.getChatDetails(chatId);
    
    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Error fetching chat details:', error);
    
    if (error.message.includes('not initialized')) {
      return res.status(401).json({
        success: false,
        error: 'Telegram client not initialized',
        message: 'Please ensure you have set up your Telegram credentials and run the login script first.',
        details: error.message
      });
    }
    
    if (error.message.includes('not authorized')) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized',
        message: 'Please run the login script to authorize your account.',
        details: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat details',
      message: error.message,
      details: error.stack
    });
  }
});

// Control auto-approve feature
router.post('/auto-approve/enable', async (req, res) => {
  try {
    await telegramService.enableAutoApprove();
    res.json({
      success: true,
      message: 'Auto-approve feature enabled'
    });
  } catch (error) {
    console.error('Error enabling auto-approve:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to enable auto-approve',
      message: error.message
    });
  }
});

router.post('/auto-approve/disable', async (req, res) => {
  try {
    await telegramService.disableAutoApprove();
    res.json({
      success: true,
      message: 'Auto-approve feature disabled'
    });
  } catch (error) {
    console.error('Error disabling auto-approve:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to disable auto-approve',
      message: error.message
    });
  }
});

router.get('/auto-approve/status', async (req, res) => {
  try {
    const status = await telegramService.getAutoApproveStatus();
    res.json({
      success: true,
      data: {
        enabled: status
      }
    });
  } catch (error) {
    console.error('Error getting auto-approve status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get auto-approve status',
      message: error.message
    });
  }
});

// Get all pending join requests for a chat
router.get('/chats/:chatId/pending-requests', async (req, res) => {
  try {
    const { chatId } = req.params;
    const pendingRequests = await telegramService.getPendingJoinRequests(chatId);
    
    res.json({
      success: true,
      data: {
        total: pendingRequests.length,
        requests: pendingRequests
      }
    });
  } catch (error) {
    console.error('Error fetching pending join requests:', error);
    
    if (error.message.includes('not initialized')) {
      return res.status(401).json({
        success: false,
        error: 'Telegram client not initialized',
        message: 'Please ensure you have set up your Telegram credentials and run the login script first.',
        details: error.message
      });
    }
    
    if (error.message.includes('not authorized')) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized',
        message: 'Please run the login script to authorize your account.',
        details: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending join requests',
      message: error.message,
      details: error.stack
    });
  }
});

// Approve all pending join requests for a chat
router.post('/chats/:chatId/approve-all', async (req, res) => {
  try {
    const { chatId } = req.params;
    const results = await telegramService.approveAllPendingRequests(chatId);
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error approving all pending requests:', error);
    
    if (error.message.includes('not initialized')) {
      return res.status(401).json({
        success: false,
        error: 'Telegram client not initialized',
        message: 'Please ensure you have set up your Telegram credentials and run the login script first.',
        details: error.message
      });
    }
    
    if (error.message.includes('not authorized')) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized',
        message: 'Please run the login script to authorize your account.',
        details: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to approve all pending requests',
      message: error.message,
      details: error.stack
    });
  }
});

module.exports = router; 