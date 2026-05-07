const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const {
  initializeDB,
  getUserByUsername,
  createUser,
  createOperation,
  getOperationByTicket,
  getOpenOperations,
  addMessage,
  getMessages,
  closeOperation,
  getAllOperations,
  getUserOperations
} = require('./database');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database
initializeDB();

// Discord Webhook
const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1501913318678335550/D521BnupDa8M3xvT0YoME0s3CDlGZqYrbXzF5pHL6AhHXMz5g4oCG69Dimadve8lCNN0';

// Helper to send Discord message
async function sendDiscordMessage(ticketNumber, productType, price) {
  try {
    await axios.post(DISCORD_WEBHOOK, {
      content: '@everyone عملية وساطة جديدة',
      embeds: [{
        color: 3447003,
        fields: [
          {
            name: 'رقم التذكرة',
            value: ticketNumber,
            inline: true
          },
          {
            name: 'نوع السلعة',
            value: productType,
            inline: true
          },
          {
            name: 'السعر',
            value: `${price} ريال`,
            inline: true
          },
          {
            name: 'الحالة',
            value: '🟢 مفتوحة',
            inline: true
          }
        ],
        timestamp: new Date()
      }]
    });
  } catch (error) {
    console.error('Discord webhook error:', error);
  }
}

// Routes

// Sign up
app.post('/api/signup', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  getUserByUsername(username, (err, user) => {
    if (user) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    createUser(username, password, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error creating user' });
      }
      res.json({ success: true, message: 'Account created successfully' });
    });
  });
});

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  getUserByUsername(username, (err, user) => {
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ 
      success: true, 
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  });
});

// Create mediation operation
app.post('/api/operations', (req, res) => {
  const { userId, productType, price, userType, sellerUsername, buyerUsername, title, category, description, amount, role } = req.body;

  if (!userId || !productType || !price || !userType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const ticketNumber = String(Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000);

  createOperation(userId, productType, price, userType, ticketNumber, sellerUsername, buyerUsername, title, category, description, amount, role, async (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error creating operation' });
    }

    // Send Discord notification
    await sendDiscordMessage(ticketNumber, productType, price);

    res.json({ 
      success: true, 
      ticketNumber,
      message: 'Operation created successfully'
    });
  });
});

// Get all open operations
app.get('/api/operations/open', (req, res) => {
  getOpenOperations((err, operations) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching operations' });
    }
    res.json(operations || []);
  });
});

// Get operations for a specific user
app.get('/api/operations/user/:username', (req, res) => {
  const { username } = req.params;
  getUserOperations(username, (err, operations) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching operations' });
    }
    res.json(operations || []);
  });
});

// Get all operations (admin)
app.get('/api/admin/operations', (req, res) => {
  getAllOperations((err, operations) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching operations' });
    }
    res.json(operations || []);
  });
});

// Get operation by ticket
app.get('/api/operations/:ticketNumber', (req, res) => {
  getOperationByTicket(req.params.ticketNumber, (err, operation) => {
    if (!operation) {
      return res.status(404).json({ error: 'Operation not found' });
    }
    res.json(operation);
  });
});

// Send message
app.post('/api/messages', (req, res) => {
  const { ticketNumber, senderRole, message } = req.body;

  if (!ticketNumber || !senderRole || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  addMessage(ticketNumber, senderRole, message, async (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error sending message' });
    }

    // Send Discord notification
    try {
      await axios.post(DISCORD_WEBHOOK, {
        content: `📧 رسالة جديدة في التذكرة ${ticketNumber}`,
        embeds: [{
          color: 65280,
          fields: [
            {
              name: 'المرسل',
              value: senderRole === 'seller' ? 'البائع' : 'المشتري',
              inline: true
            },
            {
              name: 'الرسالة',
              value: message,
              inline: false
            }
          ]
        }]
      });
    } catch (error) {
      console.error('Discord webhook error:', error);
    }

    res.json({ success: true, message: 'Message sent' });
  });
});

// Get messages for ticket
app.get('/api/messages/:ticketNumber', (req, res) => {
  getMessages(req.params.ticketNumber, (err, messages) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching messages' });
    }
    res.json(messages || []);
  });
});

// Close operation (admin)
app.post('/api/admin/close-operation', (req, res) => {
  const { ticketNumber, adminUsername } = req.body;

  if (adminUsername !== 'm5tl') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  closeOperation(ticketNumber, async (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error closing operation' });
    }

    try {
      await axios.post(DISCORD_WEBHOOK, {
        content: `🔴 تم إغلاق التذكرة ${ticketNumber}`,
        embeds: [{
          color: 16711680,
          fields: [
            {
              name: 'رقم التذكرة',
              value: ticketNumber,
              inline: true
            },
            {
              name: 'الحالة',
              value: 'مغلقة',
              inline: true
            }
          ]
        }]
      });
    } catch (error) {
      console.error('Discord webhook error:', error);
    }

    res.json({ success: true, message: 'Operation closed' });
  });
});

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
