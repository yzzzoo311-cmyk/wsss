const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'mediation.db');
const db = new sqlite3.Database(dbPath);

// Initialize database
function initializeDB() {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Mediation operations table
    db.run(`
      CREATE TABLE IF NOT EXISTS operations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticketNumber TEXT UNIQUE NOT NULL,
        userId INTEGER NOT NULL,
        productType TEXT NOT NULL,
        price REAL NOT NULL,
        userType TEXT NOT NULL,
        sellerUsername TEXT,
        buyerUsername TEXT,
        title TEXT,
        category TEXT,
        description TEXT,
        amount REAL,
        role TEXT,
        status TEXT DEFAULT 'open',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        closedAt DATETIME,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    // Add new columns if they don't exist (for existing databases)
    db.run(`ALTER TABLE operations ADD COLUMN sellerUsername TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column name')) console.error('Error adding sellerUsername:', err);
    });
    db.run(`ALTER TABLE operations ADD COLUMN buyerUsername TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column name')) console.error('Error adding buyerUsername:', err);
    });
    db.run(`ALTER TABLE operations ADD COLUMN title TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column name')) console.error('Error adding title:', err);
    });
    db.run(`ALTER TABLE operations ADD COLUMN category TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column name')) console.error('Error adding category:', err);
    });
    db.run(`ALTER TABLE operations ADD COLUMN description TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column name')) console.error('Error adding description:', err);
    });
    db.run(`ALTER TABLE operations ADD COLUMN amount REAL`, (err) => {
      if (err && !err.message.includes('duplicate column name')) console.error('Error adding amount:', err);
    });
    db.run(`ALTER TABLE operations ADD COLUMN role TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column name')) console.error('Error adding role:', err);
    });

    // Chat messages table
    db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticketNumber TEXT NOT NULL,
        senderRole TEXT NOT NULL,
        message TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticketNumber) REFERENCES operations(ticketNumber)
      )
    `);

    // Insert admin user if not exists
    db.run(`
      INSERT OR IGNORE INTO users (username, password, role)
      VALUES ('m5tl', 'm5tl123', 'admin')
    `);

    // Insert chat-only buyer user if not exists
    db.run(`
      INSERT OR IGNORE INTO users (username, password, role)
      VALUES ('mjed', 'mjed123', 'chat-only')
    `);

    console.log('✓ Database initialized');
  });
}

// Helper functions
function getAllUsers(callback) {
  db.all('SELECT * FROM users', callback);
}

function getUserByUsername(username, callback) {
  db.get('SELECT * FROM users WHERE username = ?', [username], callback);
}

function createUser(username, password, callback) {
  db.run(
    'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
    [username, password, 'user'],
    callback
  );
}

function createOperation(userId, productType, price, userType, ticketNumber, sellerUsername, buyerUsername, title, category, description, amount, role, callback) {
  db.run(
    `INSERT INTO operations (userId, productType, price, userType, ticketNumber, sellerUsername, buyerUsername, title, category, description, amount, role) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, productType, price, userType, ticketNumber, sellerUsername, buyerUsername, title, category, description, amount, role],
    callback
  );
}

function getOperationByTicket(ticketNumber, callback) {
  db.get('SELECT * FROM operations WHERE ticketNumber = ?', [ticketNumber], callback);
}

function getAllOperations(callback) {
  db.all('SELECT * FROM operations ORDER BY createdAt DESC', callback);
}

function getUserOperations(username, callback) {
  db.all('SELECT * FROM operations WHERE (sellerUsername = ? OR buyerUsername = ?) AND status = "open" ORDER BY createdAt DESC', [username, username], callback);
}

function getOpenOperations(callback) {
  db.all('SELECT * FROM operations WHERE status = "open" ORDER BY createdAt DESC', callback);
}

function addMessage(ticketNumber, senderRole, message, callback) {
  db.run(
    'INSERT INTO messages (ticketNumber, senderRole, message) VALUES (?, ?, ?)',
    [ticketNumber, senderRole, message],
    callback
  );
}

function getMessages(ticketNumber, callback) {
  db.all(
    'SELECT * FROM messages WHERE ticketNumber = ? ORDER BY createdAt ASC',
    [ticketNumber],
    callback
  );
}

function closeOperation(ticketNumber, callback) {
  db.run(
    'UPDATE operations SET status = ?, closedAt = ? WHERE ticketNumber = ?',
    ['closed', new Date().toISOString(), ticketNumber],
    callback
  );
}

module.exports = {
  db,
  initializeDB,
  getAllUsers,
  getUserByUsername,
  createUser,
  createOperation,
  getOperationByTicket,
  getAllOperations,
  getUserOperations,
  getOpenOperations,
  addMessage,
  getMessages,
  closeOperation
};
