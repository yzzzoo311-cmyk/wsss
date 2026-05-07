// Global state
let currentUser = null;
let currentOperation = null;
let messageRefreshInterval = null;

// Sample testimonials data
const testimonials = [
  { name: 'محمد السليمان', rating: '⭐⭐⭐⭐⭐', text: 'خدمة ممتازة وموثوقة جداً، سهلت لي عملياتي التجارية' },
  { name: 'فاطمة الشمري', rating: '⭐⭐⭐⭐⭐', text: 'أفضل منصة وساطة استخدمتها، آمنة وسريعة' },
  { name: 'أحمد القحطاني', rating: '⭐⭐⭐⭐⭐', text: 'أنصح بها جميع التجار، خدمة العملاء رائعة' },
  { name: 'ليلى الدوسري', rating: '⭐⭐⭐⭐⭐', text: 'تجربة رائعة، الوسطاء محترفين جداً' },
  { name: 'سارة المطيري', rating: '⭐⭐⭐⭐⭐', text: 'أفضل استثمار وقتي، المنصة سهلة الاستخدام' },
  { name: 'علي النجار', rating: '⭐⭐⭐⭐⭐', text: 'موقع احترافي جداً، الدعم سريع والخدمة ممتازة' },
  { name: 'نور العتيبي', rating: '⭐⭐⭐⭐⭐', text: 'أنا راضي جداً، عملت معهم عشرات العمليات بنجاح' },
  { name: 'خالد الراشد', rating: '⭐⭐⭐⭐⭐', text: 'الأفضل في الخليج، أوصي كل الناس بالموقع' }
];

// Sample random operations
const sampleOperations = [
  { type: 'Minecraft Account', price: 250, status: 'مكتملة', user: 'أحمد_المالك' },
  { type: 'Discord Account', price: 150, status: 'جارية', user: 'فاطمة_الحمادي' },
  { type: 'Steam Account', price: 500, status: 'مكتملة', user: 'محمد_الراشد' },
  { type: 'خدمات برمجة', price: 2000, status: 'جارية', user: 'علي_الدخيل' },
  { type: 'العملات الرقمية', price: 5000, status: 'مكتملة', user: 'نور_العتيبي' }
];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  loadTestimonials();
  checkAuth();
});

// Load testimonials
function loadTestimonials() {
  const container = document.getElementById('testimonialsContainer');
  container.innerHTML = testimonials.map(t => `
    <div class="testimonial-item">
      <div class="name">${t.name}</div>
      <div class="rating">${t.rating}</div>
      <div class="text">"${t.text}"</div>
    </div>
  `).join('');
}

// Initialize database on first load
function initializeDatabase() {
  // Init admin user
  let users = JSON.parse(localStorage.getItem('users') || '{}');
  if (!users['m5tl']) {
    users['m5tl'] = { username: 'm5tl', password: 'm5tl123', role: 'admin' };
    localStorage.setItem('users', JSON.stringify(users));
  } else if (users['m5tl'].role !== 'admin') {
    users['m5tl'].role = 'admin';
    localStorage.setItem('users', JSON.stringify(users));
  }

  if (!users['mjed']) {
    users['mjed'] = { username: 'mjed', password: 'mjed123', role: 'chat-only' };
    localStorage.setItem('users', JSON.stringify(users));
  } else if (users['mjed'].role !== 'chat-only') {
    users['mjed'].role = 'chat-only';
    localStorage.setItem('users', JSON.stringify(users));
  }

  // Init sample operations
  if (!localStorage.getItem('operations')) {
    const sampleOps = [
      {
        id: 1,
        ticketNumber: '45821',
        userId: 1,
        productType: 'Minecraft Account',
        price: 250,
        userType: 'seller',
        status: 'open',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 2,
        ticketNumber: '52034',
        userId: 2,
        productType: 'Discord Account',
        price: 150,
        userType: 'buyer',
        status: 'open',
        createdAt: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: 3,
        ticketNumber: '67543',
        userId: 3,
        productType: 'Steam Account',
        price: 500,
        userType: 'seller',
        status: 'closed',
        createdAt: new Date(Date.now() - 259200000).toISOString()
      },
      {
        id: 4,
        ticketNumber: '31209',
        userId: 4,
        productType: 'PlayStation Account',
        price: 800,
        userType: 'buyer',
        status: 'open',
        createdAt: new Date(Date.now() - 345600000).toISOString()
      },
      {
        id: 5,
        ticketNumber: '78456',
        userId: 5,
        productType: 'العملات الرقمية',
        price: 5000,
        userType: 'seller',
        status: 'open',
        createdAt: new Date(Date.now() - 432000000).toISOString()
      }
    ];
    localStorage.setItem('operations', JSON.stringify(sampleOps));
  }
}

// Check authentication
function checkAuth() {
  initializeDatabase();

  const user = localStorage.getItem('user');
  if (user) {
    currentUser = JSON.parse(user);
    showDashboard();
    loadStats();
  }
}

// Switch tab (login/signup)
function switchTab(tab) {
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

  if (tab === 'login') {
    document.getElementById('loginForm').classList.add('active');
    document.querySelector('.tab-btn:nth-child(1)').classList.add('active');
  } else {
    document.getElementById('signupForm').classList.add('active');
    document.querySelector('.tab-btn:nth-child(2)').classList.add('active');
  }
}

function showAuth(tab) {
  document.getElementById('authModal').classList.remove('hidden');
  switchTab(tab);
}

function closeAuth() {
  document.getElementById('authModal').classList.add('hidden');
}

function goHome() {
  document.getElementById('landingPage').style.display = 'block';
  document.getElementById('dashboardPage').style.display = 'none';
  document.getElementById('authModal').classList.add('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function startOperation() {
  if (!currentUser) {
    showAuth('signup');
    return;
  }

  if (currentUser.role === 'chat-only') {
    alert('هذا الحساب مخصص لدخول الشاتات فقط. يمكنك عرض العمليات وفتح الشات.');
    showDashboard('operations');
    return;
  }

  showDashboard('create');
}

function getChatRole() {
  if (!currentUser) return 'buyer';
  if (currentUser.role === 'chat-only') return 'buyer';
  return currentUser.role;
}

function scrollToSection(sectionId) {
  document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Handle signup (works with or without server)
async function handleSignup(e) {
  e.preventDefault();
  const username = document.getElementById('signupUsername').value;
  const password = document.getElementById('signupPassword').value;
  const confirm = document.getElementById('signupConfirm').value;

  if (password !== confirm) {
    alert('كلمات المرور غير متطابقة');
    return;
  }

  // Try server first, fallback to localStorage
  try {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (response.ok) {
      currentUser = { id: username, username, role: 'user' };
      localStorage.setItem('user', JSON.stringify(currentUser));
      alert('تم إنشاء الحساب بنجاح');
      showDashboard('create');
      loadStats();
      document.getElementById('signupForm').reset();
    } else {
      alert(data.error || 'خطأ في الإنشاء');
    }
  } catch (error) {
    // Fallback to localStorage
    let users = JSON.parse(localStorage.getItem('users') || '{}');
    
    if (users[username]) {
      alert('اسم المستخدم موجود بالفعل');
      return;
    }

    users[username] = { username, password, role: 'user' };
    localStorage.setItem('users', JSON.stringify(users));
    currentUser = { id: username, username, role: 'user' };
    localStorage.setItem('user', JSON.stringify(currentUser));
    
    alert('تم إنشاء الحساب بنجاح');
    showDashboard('create');
    loadStats();
    document.getElementById('signupForm').reset();
  }
}

// Handle login (works with or without server)
async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (response.ok) {
      currentUser = data.user;
      localStorage.setItem('user', JSON.stringify(currentUser));
      showDashboard('create');
      loadStats();
    } else {
      alert(data.error || 'خطأ في تسجيل الدخول');
    }
  } catch (error) {
    // Fallback to localStorage
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const user = users[username];

    if (!user || user.password !== password) {
      alert('بيانات الدخول غير صحيحة');
      return;
    }

    currentUser = {
      id: username,
      username: user.username,
      role: user.role || (username === 'm5tl' ? 'admin' : 'user')
    };
    if (username === 'm5tl' && currentUser.role !== 'admin') {
      user.role = 'admin';
      users[username] = user;
      localStorage.setItem('users', JSON.stringify(users));
    }

    localStorage.setItem('user', JSON.stringify(currentUser));
    showDashboard('create');
    loadStats();
  }
}

// Show dashboard
function showDashboard(defaultSection = 'home') {
  document.getElementById('landingPage').style.display = 'none';
  document.getElementById('authModal').classList.add('hidden');
  document.getElementById('dashboardPage').style.display = 'block';
  document.getElementById('userDisplay').textContent = currentUser.username;

  // Show admin button if admin
  const adminBtn = document.getElementById('adminBtn');
  if (currentUser.role === 'admin') {
    adminBtn.style.display = 'flex';
    adminBtn.classList.add('visible');
  } else {
    adminBtn.style.display = 'none';
    adminBtn.classList.remove('visible');
  }

  const createSidebarBtn = document.getElementById('sidebarCreateBtn');
  const homeCreateBtn = document.getElementById('homeCreateBtn');

  if (currentUser.role === 'chat-only') {
    if (createSidebarBtn) createSidebarBtn.style.display = 'none';
    if (homeCreateBtn) homeCreateBtn.style.display = 'none';
    if (defaultSection === 'create') {
      defaultSection = 'operations';
    }
  } else {
    if (createSidebarBtn) createSidebarBtn.style.display = 'flex';
    if (homeCreateBtn) homeCreateBtn.style.display = 'block';
  }

  switchSection(defaultSection);
}

// Switch section
function switchSection(section) {
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));

  let sectionElement;
  let buttonIndex;

  switch (section) {
    case 'home':
      sectionElement = document.getElementById('homeSection');
      buttonIndex = 0;
      break;
    case 'create':
      if (currentUser && currentUser.role === 'chat-only') {
        alert('هذا الحساب لا يملك صلاحية إنشاء العمليات. يمكنك فتح الشات في قسم العمليات.');
        sectionElement = document.getElementById('operationsSection');
        buttonIndex = 2;
        loadOperations();
        break;
      }
      sectionElement = document.getElementById('createSection');
      buttonIndex = 1;
      break;
    case 'operations':
      sectionElement = document.getElementById('operationsSection');
      buttonIndex = 2;
      loadOperations();
      break;
    case 'admin':
      sectionElement = document.getElementById('adminSection');
      buttonIndex = 3;
      loadAdminDashboard();
      break;
  }

  if (sectionElement) {
    sectionElement.classList.add('active');
    document.querySelectorAll('.sidebar-btn')[buttonIndex]?.classList.add('active');
  }
}

// Load stats (works with or without server)
async function loadStats() {
  let operations = [];
  
  try {
    const response = await fetch('/api/operations/open');
    operations = await response.json();
  } catch (error) {
    // Fallback to localStorage
    const allOps = JSON.parse(localStorage.getItem('operations') || '[]');
    operations = allOps.filter(op => op.status === 'open');
  }

  document.getElementById('totalOpsCount').textContent = Math.floor(Math.random() * 10000) + 5000;
  document.getElementById('completedOpsCount').textContent = Math.floor(Math.random() * 10000) + 15000;
  document.getElementById('activeUsersCount').textContent = Math.floor(Math.random() * 10000) + 10000;
}

// Handle create operation (works with or without server)
async function handleCreateOperation(e) {
  e.preventDefault();
  
  const title = document.getElementById('operationTitle').value.trim();
  const productType = document.getElementById('productType').value.trim();
  const category = document.querySelector('input[name="category"]:checked')?.value;
  const description = document.getElementById('operationDescription').value.trim();
  const amount = document.getElementById('operationAmount').value;
  const sellerUsername = document.getElementById('sellerUsername').value.trim();
  const buyerUsername = document.getElementById('buyerUsername').value.trim();
  const role = document.querySelector('input[name="operationRole"]:checked')?.value;

  if (!role) {
    alert('يرجى اختيار إذا كنت بائعاً أو مشترياً');
    return;
  }

  if (!category) {
    alert('يرجى اختيار فئة للمعاملة');
    return;
  }

  const ticketNumber = String(Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000);

  // Save to server
  try {
    const response = await fetch('/api/operations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.id,
        productType,
        price: amount,
        userType: role,
        sellerUsername,
        buyerUsername,
        title,
        category,
        description,
        amount: parseFloat(amount),
        role
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save to server');
    }
  } catch (error) {
    console.error('Server save failed, using localStorage:', error);
  }

  let operations = JSON.parse(localStorage.getItem('operations') || '[]');
  
  const newOp = {
    id: operations.length + 1,
    ticketNumber,
    userId: currentUser.id || currentUser.username,
    title,
    productType,
    category,
    description,
    amount: parseFloat(amount),
    sellerUsername,
    buyerUsername,
    role,
    status: 'open',
    createdAt: new Date().toISOString()
  };

  operations.push(newOp);
  localStorage.setItem('operations', JSON.stringify(operations));

  alert('✅ تم إنشاء المعاملة بنجاح!');
  document.getElementById('operationForm').reset();
  
  currentOperation = {
    ticketNumber,
    title,
    productType,
    category,
    description,
    amount: parseFloat(amount),
    sellerUsername,
    buyerUsername,
    role
  };

  await sendToDiscordWebhook(ticketNumber, productType, amount);

  openChat(ticketNumber);
  switchSection('operations');
  loadOperations();
}

// Load operations (works with or without server)
async function loadOperations() {
  let operations = [];
  
  try {
    let url;
    if (currentUser.role === 'admin') {
      url = '/api/admin/operations';
    } else if (currentUser.role === 'chat-only') {
      // For chat-only users, show all open operations
      url = '/api/operations/open';
    } else {
      url = `/api/operations/user/${currentUser.username}`;
    }
    const response = await fetch(url);
    operations = await response.json();
  } catch (error) {
    const allOps = JSON.parse(localStorage.getItem('operations') || '[]');
    if (currentUser.role === 'admin') {
      operations = allOps;
    } else if (currentUser.role === 'chat-only') {
      operations = allOps.filter(op => op.status === 'open');
    } else {
      operations = allOps.filter(op => op.status === 'open' && (op.sellerUsername === currentUser.username || op.buyerUsername === currentUser.username));
    }
  }

  const container = document.getElementById('operationsList');
  container.innerHTML = operations.map(op => `
    <div class="operation-card">
      <div class="operation-header">
        <h3>${op.title || op.productType}</h3>
        <span class="ticket-badge">التذكرة: ${op.ticketNumber}</span>
      </div>
      <div class="operation-details">
        <div class="detail-item">
          <div class="detail-label">السعر</div>
          <div class="detail-value">${op.amount || op.price} ريال</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">الفئة</div>
          <div class="detail-value">${op.category || op.productType}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">دورك</div>
          <div class="detail-value">${op.role === 'seller' ? 'بائع' : op.role === 'buyer' ? 'مشتري' : 'وسيط'}</div>
        </div>
        ${op.sellerUsername ? `
          <div class="detail-item">
            <div class="detail-label">بائع المنصة</div>
            <div class="detail-value">${op.sellerUsername}</div>
          </div>
        ` : ''}
        ${op.buyerUsername ? `
          <div class="detail-item">
            <div class="detail-label">مشتري المنصة</div>
            <div class="detail-value">${op.buyerUsername}</div>
          </div>
        ` : ''}
        <div class="detail-item">
          <div class="detail-label">الحالة</div>
          <div class="detail-value">${op.status === 'open' ? '🟢 مفتوحة' : '🔴 مغلقة'}</div>
        </div>
      </div>
      <div class="operation-actions">
        <button onclick="openChat('${op.ticketNumber}')" class="btn-chat">💬 فتح الشات</button>
      </div>
    </div>
  `).join('');

  if (operations.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #888; padding: 30px;">لا توجد عمليات جارية</p>';
  }
}

// Open chat
function openChat(ticketNumber) {
  currentOperation = { ticketNumber, role: getChatRole() };
  document.getElementById('chatWindow').classList.add('active');
  document.getElementById('chatSearchInput').value = '';
  document.getElementById('ticketDisplay').textContent = `التذكرة: ${ticketNumber}`;
  
  loadMessages(ticketNumber);

  if (messageRefreshInterval) {
    clearInterval(messageRefreshInterval);
  }

  messageRefreshInterval = setInterval(() => {
    if (document.getElementById('chatWindow').classList.contains('active')) {
      loadMessages(ticketNumber);
    }
  }, 1000);
}

// Load messages (works with or without server)
async function loadMessages(ticketNumber, query = '') {
  const messages = JSON.parse(localStorage.getItem(`messages_${ticketNumber}`) || '[]');
  const container = document.getElementById('messagesContainer');
  const search = query.trim().toLowerCase();

  const filtered = messages.filter(msg => {
    const text = (msg.message || '').toLowerCase();
    const sender = (msg.sender || msg.senderRole || '').toString().toLowerCase();
    return !search || text.includes(search) || sender.includes(search);
  });

  if (filtered.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 20px; color: #999;">لا توجد رسائل بعد</div>';
    return;
  }

  container.innerHTML = filtered.map(msg => {
    const sender = (msg.sender || msg.senderRole || '').toString().toLowerCase();
    const isCurrentUser = sender === currentOperation.role;
    const displayRole = sender === 'seller' ? 'البائع' : sender === 'buyer' ? 'المشتري' : 'الوسيط';
    
    return `
      <div class="message ${isCurrentUser ? 'sent' : 'received'}">
        <div class="message-sender">${displayRole}</div>
        <div>${msg.message}</div>
        <div style="font-size: 11px; margin-top: 3px; opacity: 0.7;">
          ${new Date(msg.createdAt).toLocaleTimeString('ar-SA')}
        </div>
      </div>
    `;
  }).join('');

  container.scrollTop = container.scrollHeight;
}

// Search inside chat
function filterChatMessages() {
  const query = document.getElementById('chatSearchInput').value;
  if (currentOperation && currentOperation.ticketNumber) {
    loadMessages(currentOperation.ticketNumber, query);
  }
}

// Send message (works with or without server)
async function sendMessage() {
  const messageInput = document.getElementById('messageInput');
  const message = messageInput.value.trim();

  if (!message || !currentOperation) return;

  const messages = JSON.parse(localStorage.getItem(`messages_${currentOperation.ticketNumber}`) || '[]');
  messages.push({
    ticketNumber: currentOperation.ticketNumber,
    sender: currentOperation.role || 'mediator',
    message,
    createdAt: new Date().toISOString()
  });
  localStorage.setItem(`messages_${currentOperation.ticketNumber}`, JSON.stringify(messages));
  
  await sendMessageToDiscord(currentOperation.ticketNumber, currentOperation.role || 'mediator', message);

  messageInput.value = '';
  loadMessages(currentOperation.ticketNumber);
}

// Send to Discord Webhook (with CORS proxy fallback)
async function sendToDiscordWebhook(ticketNumber, productType, price) {
  const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1501913318678335550/D521BnupDa8M3xvT0YoME0s3CDlGZqYrbXzF5pHL6AhHXMz5g4oCG69Dimadve8lCNN0';
  
  try {
    const payload = {
      content: '@everyone عملية وساطة جديدة 🔔',
      embeds: [{
        color: 3447003,
        title: 'عملية وساطة جديدة',
        fields: [
          { name: 'رقم التذكرة', value: ticketNumber, inline: true },
          { name: 'نوع السلعة', value: productType, inline: true },
          { name: 'السعر', value: `${price} ريال`, inline: true },
          { name: 'الحالة', value: '🟢 مفتوحة', inline: true }
        ],
        timestamp: new Date()
      }]
    };

    // Try direct request first
    await fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      mode: 'no-cors'
    }).catch(() => {});
    
  } catch (error) {
    console.log('Discord notification (offline mode)');
  }
}

// Send message to Discord (for chat messages)
async function sendMessageToDiscord(ticketNumber, senderRole, message) {
  const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1501913318678335550/D521BnupDa8M3xvT0YoME0s3CDlGZqYrbXzF5pHL6AhHXMz5g4oCG69Dimadve8lCNN0';
  
  try {
    const payload = {
      content: `📧 رسالة جديدة في التذكرة ${ticketNumber}`,
      embeds: [{
        color: 65280,
        fields: [
          { name: 'التذكرة', value: ticketNumber, inline: true },
          { name: 'المرسل', value: senderRole === 'seller' ? '👨 البائع' : senderRole === 'buyer' ? '👩 المشتري' : '👔 ' + senderRole, inline: true },
          { name: 'الرسالة', value: message, inline: false }
        ],
        timestamp: new Date()
      }]
    };

    await fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      mode: 'no-cors'
    }).catch(() => {});
    
  } catch (error) {
    console.log('Discord notification sent');
  }
}

// Close chat
function closeChat() {
  if (messageRefreshInterval) {
    clearInterval(messageRefreshInterval);
    messageRefreshInterval = null;
  }
  document.getElementById('chatWindow').classList.remove('active');
  document.getElementById('messagesContainer').innerHTML = '';
  document.getElementById('messageInput').value = '';
}

// Load admin dashboard (works with or without server)
async function loadAdminDashboard() {
  if (currentUser.role !== 'admin') {
    alert('أنت لست مسؤول');
    return;
  }

  let operations = [];
  
  try {
    const response = await fetch('/api/admin/operations');
    operations = await response.json();
  } catch (error) {
    // Fallback to localStorage
    operations = JSON.parse(localStorage.getItem('operations') || '[]');
  }

  const container = document.getElementById('adminTicketsList');
  container.innerHTML = operations.map(op => `
    <div class="ticket-card">
      <div class="ticket-header">
        <h3>التذكرة: ${op.ticketNumber}</h3>
        <span class="status-badge ${op.status}">
          ${op.status === 'open' ? '🟢 مفتوحة' : '🔴 مغلقة'}
        </span>
      </div>
      <div class="ticket-info">
        <div class="detail-item">
          <div class="detail-label">النوع</div>
          <div class="detail-value">${op.productType}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">السعر</div>
          <div class="detail-value">${op.price} ريال</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">الدور</div>
          <div class="detail-value">${op.userType === 'seller' ? 'بائع' : 'مشتري'}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">التاريخ</div>
          <div class="detail-value">${new Date(op.createdAt).toLocaleDateString('ar-SA')}</div>
        </div>
      </div>
      <div class="ticket-actions">
        <button onclick="adminOpenChat('${op.ticketNumber}')" class="btn-view-chat">💬 فتح الشات</button>
        <button onclick="closeTicket('${op.ticketNumber}')" class="btn-close-ticket">❌ إغلاق التذكرة</button>
      </div>
    </div>
  `).join('');

  if (operations.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #888; padding: 30px;">لا توجد تذاكر</p>';
  }
}

// Admin open chat
function adminOpenChat(ticketNumber) {
  currentOperation = { ticketNumber, role: 'mediator' };
  document.getElementById('chatWindow').classList.add('active');
  document.getElementById('ticketDisplay').textContent = `التذكرة: ${ticketNumber}`;
  loadMessages(ticketNumber);
}

// Close ticket (works with or without server)
async function closeTicket(ticketNumber) {
  if (!confirm('هل تريد إغلاق هذه التذكرة؟')) return;

  try {
    const response = await fetch('/api/admin/close-operation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticketNumber,
        adminUsername: 'm5tl'
      })
    });

    if (response.ok) {
      alert('تم إغلاق التذكرة بنجاح');
      loadAdminDashboard();
      closeChat();
    }
  } catch (error) {
    // Fallback to localStorage
    let operations = JSON.parse(localStorage.getItem('operations') || '[]');
    operations = operations.map(op => 
      op.ticketNumber === ticketNumber 
        ? { ...op, status: 'closed', closedAt: new Date().toISOString() }
        : op
    );
    localStorage.setItem('operations', JSON.stringify(operations));
    
    alert('تم إغلاق التذكرة بنجاح');
    loadAdminDashboard();
    closeChat();
  }
}

// Logout
function logout() {
  if (messageRefreshInterval) {
    clearInterval(messageRefreshInterval);
    messageRefreshInterval = null;
  }
  localStorage.removeItem('user');
  currentUser = null;
  currentOperation = null;
  document.getElementById('landingPage').style.display = 'block';
  document.getElementById('dashboardPage').style.display = 'none';
  document.getElementById('authModal').classList.add('hidden');
  document.getElementById('loginForm').classList.add('active');
  document.getElementById('loginForm').reset();
  switchTab('login');
}

// Add some visual effects
document.addEventListener('DOMContentLoaded', () => {
  // Add floating animation to elements
  const style = document.createElement('style');
  style.textContent = `
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    
    .stat-card {
      animation: float 3s ease-in-out infinite;
    }
    
    .stat-card:nth-child(2) {
      animation-delay: 0.5s;
    }
    
    .stat-card:nth-child(3) {
      animation-delay: 1s;
    }
  `;
  document.head.appendChild(style);
});
