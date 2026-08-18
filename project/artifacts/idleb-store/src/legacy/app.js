/* ===== IDLEB STORE - Full App with EmailJS OTP ===== */
(function() {
  'use strict';

  console.log('✅ IDLEB STORE loading...');

  // ========== STORAGE KEYS ==========
  var KEYS = {
    categories: 'idleb_categories',
    products: 'idleb_products',
    users: 'idleb_users',
    pendingUsers: 'idleb_pending_users',
    currentUser: 'idleb_current_user',
    cart: 'idleb_cart',
    topups: 'idleb_topups',
    orders: 'idleb_orders',
    adminSession: 'idleb_admin_session',
    settings: 'idleb_site_settings'
  };

  // ========== ADMIN ==========
  var ADMIN_USER = 'admin';
  var ADMIN_PASS = 'Idleb@2025';

  // ========== EMAILJS SETTINGS ==========
  var EMAILJS_CONFIG = {
    publicKey: '-MV0a0jjrdW0VbOML',
    serviceId: 'service_y22dlbp',
    templateId: 'template_ncqtx0e'
  };

  // ========== HELPERS ==========
  function load(key, fallback) {
    try {
      var data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch(e) {
      console.error('Storage read error:', key, e);
      return fallback;
    }
  }

  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch(e) {
      console.error('Storage write error:', key, e);
      toast('تعذر حفظ البيانات في المتصفح', true);
    }
  }

  function uid(prefix) {
    return (prefix || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function safeUrl(value, fallback) {
    var url = String(value || '').trim();
    if (!url) return fallback;
    if (/^(https?:|data:image\/|blob:)/i.test(url)) return url;
    return fallback;
  }

  function toast(msg, isError) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'toast show' + (isError ? ' error' : '');
    setTimeout(function() { el.classList.remove('show'); }, 3500);
  }

  function formatPrice(n) {
    var number = Number(n);
    if (!isFinite(number)) number = 0;
    return number.toLocaleString('ar-SY') + ' $';
  }

  function placeholderImg(text) {
    return 'https://placehold.co/400x250/8b5cf6/ffffff?text=' + encodeURIComponent(text || 'IDLEB STORE');
  }

  function typeLabel(t) {
    var map = {
      accounts: 'تبنيد',
      unban: 'فك باند',
      boost_followers: 'رشق متابعين',
      boost_engagement: 'رشق تفاعل',
      boost_views: 'رشق مشاهدات',
      games: 'شحن ألعاب',
      other: 'خدمة أخرى'
    };
    return map[t] || t || 'خدمة';
  }

  function generateOTP() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  // ========== DEFAULT DATA ==========
  var DEFAULT_CATEGORIES = [
    { id: 'cat1', name: 'تبنيد حسابات', image: '', order: 1 },
    { id: 'cat2', name: 'فك باند', image: '', order: 2 },
    { id: 'cat3', name: 'خدمات الرشق', image: '', order: 3 },
    { id: 'cat4', name: 'شحن ألعاب', image: '', order: 4 }
  ];

  var DEFAULT_PRODUCTS = [
    { id: 'p1', name: 'تبنيد انستغرام', desc: 'حسابات انستغرام جاهزة', price: 15, image: '', categoryId: 'cat1', type: 'accounts', active: true, sales: 42 },
    { id: 'p2', name: 'تبنيد فيسبوك', desc: 'حسابات فيسبوك قديمة', price: 12, image: '', categoryId: 'cat1', type: 'accounts', active: true, sales: 35 },
    { id: 'p3', name: 'تبنيد تليجرام', desc: 'أرقام تليجرام جاهزة', price: 10, image: '', categoryId: 'cat1', type: 'accounts', active: true, sales: 28 },
    { id: 'p4', name: 'تبنيد واتساب', desc: 'أرقام واتساب مع تحقق', price: 18, image: '', categoryId: 'cat1', type: 'accounts', active: true, sales: 50 },
    { id: 'p5', name: 'فك باند انستغرام', desc: 'فك حظر انستغرام', price: 25, image: '', categoryId: 'cat2', type: 'unban', active: true, sales: 60 },
    { id: 'p6', name: 'فك باند واتساب', desc: 'استعادة رقم محظور', price: 30, image: '', categoryId: 'cat2', type: 'unban', active: true, sales: 45 },
    { id: 'p7', name: 'فك باند فيسبوك', desc: 'فك حظر حسابات فيسبوك', price: 22, image: '', categoryId: 'cat2', type: 'unban', active: true, sales: 33 },
    { id: 'p8', name: 'فك باند تليجرام', desc: 'فك حظر قنوات', price: 20, image: '', categoryId: 'cat2', type: 'unban', active: true, sales: 20 },
    { id: 'p9', name: 'فك باند تيك توك', desc: 'استعادة حسابات تيك توك', price: 28, image: '', categoryId: 'cat2', type: 'unban', active: true, sales: 38 },
    { id: 'p10', name: 'رشق متابعين انستغرام', desc: 'كل 1000 متابع', price: 2, unitSize: 1000, image: '', categoryId: 'cat3', type: 'boost_followers', active: true, sales: 90, pricingNote: 'كل 1000 متابع = 2$' },
    { id: 'p11', name: 'رشق تفاعل انستغرام', desc: 'كل 1000 تفاعل', price: 1.5, unitSize: 1000, image: '', categoryId: 'cat3', type: 'boost_engagement', active: true, sales: 55, pricingNote: 'كل 1000 تفاعل = 1.5$' },
    { id: 'p12', name: 'رشق مشاهدات', desc: 'كل 1000 مشاهدة', price: 1, unitSize: 1000, image: '', categoryId: 'cat3', type: 'boost_views', active: true, sales: 40, pricingNote: 'كل 1000 مشاهدة = 1$' },
    { id: 'p13', name: 'رشق متابعين تيك توك', desc: 'كل 1000 متابع', price: 2, unitSize: 1000, image: '', categoryId: 'cat3', type: 'boost_followers', active: true, sales: 75, pricingNote: 'كل 1000 متابع = 2$' },
    { id: 'p14', name: 'رشق أعضاء تليجرام', desc: 'كل 1000 عضو', price: 2, unitSize: 1000, image: '', categoryId: 'cat3', type: 'boost_followers', active: true, sales: 30, pricingNote: 'كل 1000 عضو = 2$' },
    { id: 'p15', name: 'شحن ببجي', desc: 'شحن UC', price: 10, unitSize: 1, image: '', categoryId: 'cat4', type: 'games', active: true, sales: 120, pricingNote: 'كل 1 وحدة = 10$' },
    { id: 'p16', name: 'شحن لودو', desc: 'شحن عملات', price: 8, unitSize: 1, image: '', categoryId: 'cat4', type: 'games', active: true, sales: 65, pricingNote: 'كل 1 وحدة = 8$' },
    { id: 'p17', name: 'شحن جواكر', desc: 'شحن عملات', price: 7, unitSize: 1, image: '', categoryId: 'cat4', type: 'games', active: true, sales: 48, pricingNote: 'كل 1 وحدة = 7$' },
    { id: 'p18', name: 'شحن فري فاير', desc: 'شحن جواهر', price: 9, unitSize: 1, image: '', categoryId: 'cat4', type: 'games', active: true, sales: 95, pricingNote: 'كل 1 وحدة = 9$' }
  ];

  // ========== INIT DATA ==========
  function initData() {
    console.log('🗃️ Initializing store data...');
    if (!localStorage.getItem(KEYS.categories)) save(KEYS.categories, DEFAULT_CATEGORIES);
    if (!localStorage.getItem(KEYS.products)) save(KEYS.products, DEFAULT_PRODUCTS);
    if (!localStorage.getItem(KEYS.users)) save(KEYS.users, []);
    if (!localStorage.getItem(KEYS.pendingUsers)) save(KEYS.pendingUsers, []);
    if (!localStorage.getItem(KEYS.topups)) save(KEYS.topups, []);
    if (!localStorage.getItem(KEYS.orders)) save(KEYS.orders, []);
    if (!localStorage.getItem(KEYS.cart)) save(KEYS.cart, []);
  }

  // ========== STATE ==========
  var currentUser = null;
  var cart = [];
  var adminLoggedIn = false;
  var pendingVerificationUser = null;
  var categoryFilters = {
    query: '',
    sort: 'popular'
  };

  function loadState() {
    console.log('🔄 Loading store state...');
    currentUser = load(KEYS.currentUser, null);
    cart = load(KEYS.cart, []);
    adminLoggedIn = !!sessionStorage.getItem(KEYS.adminSession);
    updateUI();
  }

  function updateUI() {
    var loginBtn = document.getElementById('loginNavBtn');
    var logoutBtn = document.getElementById('logoutBtn');
    var balanceEl = document.getElementById('userBalance');
    var balAmount = document.getElementById('balanceAmount');
    var walletBal = document.getElementById('walletBalance');

    if (currentUser) {
      if (loginBtn) loginBtn.classList.add('hidden');
      if (logoutBtn) logoutBtn.classList.remove('hidden');
      if (balanceEl) balanceEl.classList.remove('hidden');
      if (balAmount) balAmount.textContent = formatPrice(currentUser.balance || 0);
      if (walletBal) walletBal.textContent = formatPrice(currentUser.balance || 0);
    } else {
      if (loginBtn) loginBtn.classList.remove('hidden');
      if (logoutBtn) logoutBtn.classList.add('hidden');
      if (balanceEl) balanceEl.classList.add('hidden');
      if (walletBal) walletBal.textContent = '0 $';
    }

    var badge = document.getElementById('cartBadge');
    if (badge) {
      var count = 0;
      for (var i = 0; i < cart.length; i++) count += Number(cart[i].qty || 0);
      badge.textContent = count;
    }
  }

  // ========== EMAILJS ==========
  function initEmailJS() {
    if (typeof emailjs === 'undefined') {
      console.warn('EmailJS not loaded');
      return false;
    }
    try {
      emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
      return true;
    } catch(e) {
      console.error('EmailJS init error:', e);
      return false;
    }
  }

  window.sendVerificationEmail = async function(user) {
    console.log('📧 sendVerificationEmail called');
    if (typeof emailjs === 'undefined') throw new Error('EmailJS library not loaded');
    if (!user || !user.email) throw new Error('Email required');

    var code = generateOTP();
    var expiry = 24;
    var expiresAt = new Date(Date.now() + expiry * 60 * 60 * 1000).toISOString();
    var pending = load(KEYS.pendingUsers, []);
    var existing = null;

    for (var i = 0; i < pending.length; i++) {
      if (pending[i].email === user.email || pending[i].username === user.username) {
        existing = pending[i];
        break;
      }
    }

    var record = {
      username: user.username,
      email: user.email,
      password: user.password,
      verification_code: code,
      expiresAt: expiresAt,
      createdAt: new Date().toISOString()
    };

    if (existing) {
      for (var key in record) existing[key] = record[key];
    } else {
      pending.push(record);
    }
    save(KEYS.pendingUsers, pending);
    pendingVerificationUser = record;

    if (!initEmailJS()) throw new Error('EmailJS init failed');

    var params = {
      to_email: user.email,
      email: user.email,
      username: user.username,
      name: user.username,
      verification_code: code,
      code: code,
      otp: code,
      expiry_hours: expiry
    };

    console.log('📧 Sending OTP to:', user.email, 'Code:', code);
    try {
      await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, params);
      console.log('✅ Email sent successfully');
    } catch(e) {
      console.error('❌ Email send error:', e);
      throw new Error('Failed to send email: ' + (e.text || e.message));
    }
    return { code: code, expiresAt: expiresAt };
  };

  // ========== VERIFY OTP ==========
  window.verifyOTP = function() {
    console.log('🔐 verifyOTP called');
    var codeInput = document.getElementById('verificationCodeInput');
    var emailInput = document.getElementById('authEmail');
    var usernameInput = document.getElementById('authUsername');
    if (!codeInput || !emailInput || !usernameInput) {
      toast('حدث خطأ في الصفحة', true);
      return;
    }

    var code = codeInput.value.trim();
    var email = emailInput.value.trim().toLowerCase();
    var username = usernameInput.value.trim();
    console.log('📝 Verifying - Code:', code, 'Email:', email, 'Username:', username);

    if (!code || code.length !== 6) {
      toast('أدخل رمز التفعيل المكوّن من 6 أرقام', true);
      return;
    }

    var pending = load(KEYS.pendingUsers, []);
    var user = null;
    var idx = -1;
    for (var i = 0; i < pending.length; i++) {
      if (pending[i].email === email || pending[i].username === username) {
        user = pending[i];
        idx = i;
        break;
      }
    }
    if (!user) {
      toast('لم يتم العثور على حساب بانتظار التفعيل', true);
      return;
    }
    if (user.expiresAt && Date.now() > new Date(user.expiresAt).getTime()) {
      toast('انتهت صلاحية الرمز، يرجى طلب رمز جديد', true);
      return;
    }
    if (String(user.verification_code) !== String(code)) {
      toast('❌ رمز التفعيل غير صحيح', true);
      return;
    }

    var users = load(KEYS.users, []);
    var newUser = {
      username: user.username,
      email: user.email,
      password: user.password,
      balance: 0,
      isVerified: true,
      verifiedAt: new Date().toISOString(),
      createdAt: user.createdAt || new Date().toISOString()
    };
    var exists = false;
    for (var j = 0; j < users.length; j++) {
      if (users[j].username === user.username || users[j].email === user.email) {
        users[j] = newUser;
        exists = true;
        break;
      }
    }
    if (!exists) users.push(newUser);
    save(KEYS.users, users);
    pending.splice(idx, 1);
    save(KEYS.pendingUsers, pending);

    var codeBox = document.getElementById('verificationCodeBox');
    var retryBox = document.getElementById('verificationRetryBox');
    if (codeBox) codeBox.classList.add('hidden');
    if (retryBox) retryBox.classList.add('hidden');

    toast('✅ تم تفعيل حسابك بنجاح!');
    currentUser = { username: user.username, email: user.email, balance: 0 };
    save(KEYS.currentUser, currentUser);
    updateUI();
    setTimeout(function() { showPage('home'); }, 500);
  };

  // ========== RESEND VERIFICATION ==========
  window.resendVerification = async function() {
    console.log('🔄 resendVerification called');
    var emailInput = document.getElementById('authEmail');
    var usernameInput = document.getElementById('authUsername');
    if (!emailInput || !usernameInput) {
      toast('حدث خطأ في الصفحة', true);
      return;
    }

    var email = emailInput.value.trim().toLowerCase();
    var username = usernameInput.value.trim();
    if (!email && !username) {
      toast('أدخل البريد الإلكتروني أو اسم المستخدم', true);
      return;
    }

    var pending = load(KEYS.pendingUsers, []);
    var user = null;
    for (var i = 0; i < pending.length; i++) {
      if (pending[i].email === email || pending[i].username === username) {
        user = pending[i];
        break;
      }
    }
    if (!user) {
      toast('لم يتم العثور على حساب بانتظار التفعيل', true);
      return;
    }

    try {
      toast('📧 جاري إرسال رمز جديد...');
      await window.sendVerificationEmail(user);
      var retryMessage = document.getElementById('verificationRetryMessage');
      if (retryMessage) retryMessage.textContent = '✅ تم إرسال رمز جديد إلى ' + user.email;
      toast('✅ تم إرسال رمز جديد إلى بريدك الإلكتروني');
    } catch(e) {
      console.error('❌ Resend error:', e);
      toast('❌ فشل إرسال البريد: ' + e.message, true);
    }
  };

  // Compatibility handler used by the verification page in index.html.
  window.resendVerificationEmail = function() {
    console.log('🔄 resendVerificationEmail called');
    return window.resendVerification();
  };

  // ========== NAVIGATION ==========
  window.showPage = function(pageId, param) {
    console.log('📍 showPage called:', pageId, param);
    var pages = document.querySelectorAll('.page');
    for (var i = 0; i < pages.length; i++) pages[i].classList.remove('active');

    var page = document.getElementById('page-' + pageId);
    if (!page) {
      console.error('❌ Page not found:', 'page-' + pageId);
      toast('الصفحة المطلوبة غير موجودة', true);
      return;
    }
    page.classList.add('active');

    var navLinks = document.getElementById('navLinks');
    if (navLinks) navLinks.classList.remove('open');

    if (pageId === 'home') renderHome();
    if (pageId === 'categories') renderCategories();
    if (pageId === 'category' && param) renderCategoryProducts(param);
    if (pageId === 'product-detail' && param) renderProductDetail(param);
    if (pageId === 'cart') renderCart();
    if (pageId === 'orders') renderUserOrders();
    if (pageId === 'about') renderAbout();

    if (pageId === 'admin') {
      var adminLoginEl = document.getElementById('adminLogin');
      var adminPanelEl = document.getElementById('adminPanel');
      if (adminLoggedIn) {
        if (adminLoginEl) adminLoginEl.classList.add('hidden');
        if (adminPanelEl) adminPanelEl.classList.remove('hidden');
        switchAdminTab('stats');
      } else {
        if (adminLoginEl) adminLoginEl.classList.remove('hidden');
        if (adminPanelEl) adminPanelEl.classList.add('hidden');
      }
    }

    if (pageId === 'category' && param) {
      history.replaceState(null, '', '#category/' + encodeURIComponent(param));
    } else if (pageId === 'product-detail' && param) {
      history.replaceState(null, '', '#product/' + encodeURIComponent(param));
    } else if (pageId !== 'home') {
      history.replaceState(null, '', '#' + pageId);
    } else {
      history.replaceState(null, '', '#home');
    }

    if (window.scrollTo) window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ========== RENDER HOME ==========
  function renderHome() {
    console.log('🏠 renderHome called');
    var cats = load(KEYS.categories, []).sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
    var allProds = load(KEYS.products, []);
    var prods = [];
    for (var i = 0; i < allProds.length; i++) {
      if (allProds[i].active) prods.push(allProds[i]);
    }
    prods.sort(function(a, b) { return (b.sales || 0) - (a.sales || 0); });
    prods = prods.slice(0, 6);

    var catGrid = document.getElementById('homeCategories');
    if (catGrid) {
      var html = '';
      for (var cIndex = 0; cIndex < cats.length; cIndex++) {
        var c = cats[cIndex];
        var catId = escapeHtml(c.id);
        html += '<div class="category-card" onclick="showPage(\'category\', \'' + catId + '\')" style="cursor:pointer;">';
        html += '<img src="' + escapeHtml(safeUrl(c.image, placeholderImg(c.name))) + '" alt="' + escapeHtml(c.name) + '" style="width:100%; height:150px; object-fit:cover;">';
        html += '<div class="card-body" style="padding:12px;"><h3 style="margin:0; text-align:center;">' + escapeHtml(c.name) + '</h3></div></div>';
      }
      catGrid.innerHTML = html;
    }

    var bestEl = document.getElementById('bestSellers');
    if (bestEl) {
      var html2 = '';
      for (var pIndex = 0; pIndex < prods.length; pIndex++) html2 += productCardHTML(prods[pIndex]);
      bestEl.innerHTML = html2;
    }
  }

  // ========== PRODUCT CARD HTML ==========
  function productCardHTML(p) {
    console.log('🧩 productCardHTML called:', p && p.id);
    if (!p || !p.id) return '';

    var productId = escapeHtml(p.id);
    var productName = escapeHtml(p.name || 'منتج');
    var productImage = escapeHtml(safeUrl(p.image, placeholderImg(p.name)));
    var productDescription = escapeHtml(p.desc || '');

    // The click handler is on the whole card, not only the button.
    // The button stops bubbling so it invokes the same action exactly once.
    return '<div class="product-card" role="button" tabindex="0" onclick="openProductDetail(\'' + productId + '\')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();openProductDetail(\'' + productId + '\')}" style="cursor:pointer; background:#14131a; border-radius:14px; border:1px solid #2a2735; overflow:hidden; transition:0.2s;">' +
      '<img src="' + productImage + '" alt="' + productName + '" style="width:100%; height:150px; object-fit:cover; background:#1c1b24;">' +
      (Number(p.sales || 0) >= 60 ? '<span class="ux-product-badge">الأكثر مبيعاً</span>' : '') +
      '<div class="card-body" style="padding:12px;">' +
      '<span class="product-type" style="display:inline-block; background:rgba(139,92,246,0.12); color:#8b5cf6; padding:2px 10px; border-radius:6px; font-size:0.65rem;">' + escapeHtml(typeLabel(p.type)) + '</span>' +
      '<h3 style="margin:6px 0 2px; font-size:0.95rem; color:#f4f2f8;">' + productName + '</h3>' +
      '<p style="color:#9b96a8; font-size:0.8rem; margin:0 0 8px;">' + productDescription + '</p>' +
      '<div class="product-price" style="font-size:1rem; font-weight:700; color:#8b5cf6; margin-bottom:8px;">' + formatPrice(p.price) + '</div>' +
      '<button class="btn btn-primary btn-full" onclick="event.stopPropagation(); openProductDetail(\'' + productId + '\')" style="width:100%; padding:8px; font-size:0.8rem; border-radius:8px; background:#8b5cf6; color:#fff; border:none; cursor:pointer;">📦 عرض التفاصيل</button>' +
      '</div></div>';
  }

  // ========== CATEGORIES ==========
  function renderCategories() {
    console.log('📂 renderCategories called');
    var cats = load(KEYS.categories, []).sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
    var grid = document.getElementById('allCategories');
    if (!grid) return;

    var html = '';
    for (var i = 0; i < cats.length; i++) {
      var c = cats[i];
      var catId = escapeHtml(c.id);
      html += '<div class="category-card" onclick="showPage(\'category\', \'' + catId + '\')" style="cursor:pointer; background:#14131a; border-radius:14px; border:1px solid #2a2735; overflow:hidden; transition:0.2s;">';
      html += '<img src="' + escapeHtml(safeUrl(c.image, placeholderImg(c.name))) + '" alt="' + escapeHtml(c.name) + '" style="width:100%; height:150px; object-fit:cover;">';
      html += '<div class="card-body" style="padding:12px;"><h3 style="margin:0; text-align:center; color:#f4f2f8;">' + escapeHtml(c.name) + '</h3></div></div>';
    }
    grid.innerHTML = html;
  }

  // ========== CATEGORY PRODUCTS ==========
  function renderCategoryProducts(catId) {
    console.log('📦 renderCategoryProducts called:', catId);
    var cats = load(KEYS.categories, []);
    var cat = null;
    for (var i = 0; i < cats.length; i++) {
      if (String(cats[i].id) === String(catId)) { cat = cats[i]; break; }
    }

    var titleEl = document.getElementById('categoryTitle');
    if (titleEl) titleEl.textContent = cat ? cat.name : 'المنتجات';

    var allProds = load(KEYS.products, []);
    var prods = [];
    for (var j = 0; j < allProds.length; j++) {
      if (String(allProds[j].categoryId) === String(catId) && allProds[j].active) prods.push(allProds[j]);
    }

    var searchEl = document.getElementById('categorySearch');
    var sortEl = document.getElementById('categorySort');
    categoryFilters.query = searchEl ? searchEl.value.trim().toLowerCase() : categoryFilters.query;
    categoryFilters.sort = sortEl ? sortEl.value : categoryFilters.sort;
    if (categoryFilters.query) {
      prods = prods.filter(function(product) {
        var searchable = [
          product.name || '',
          product.desc || '',
          typeLabel(product.type)
        ].join(' ').toLowerCase();
        return searchable.indexOf(categoryFilters.query) !== -1;
      });
    }
    prods.sort(function(a, b) {
      if (categoryFilters.sort === 'price-low') return Number(a.price || 0) - Number(b.price || 0);
      if (categoryFilters.sort === 'price-high') return Number(b.price || 0) - Number(a.price || 0);
      return Number(b.sales || 0) - Number(a.sales || 0);
    });

    var grid = document.getElementById('categoryProducts');
    if (!grid) return;
    if (prods.length === 0) {
      grid.innerHTML = '<div class="ux-no-results"><strong>لم نجد منتجات مطابقة</strong><span>جرّب تغيير كلمة البحث أو الفلتر.</span><button class="btn btn-secondary" onclick="clearCategoryFilters()">مسح البحث</button></div>';
      return;
    }

    var html = '';
    for (var pIndex = 0; pIndex < prods.length; pIndex++) html += productCardHTML(prods[pIndex]);
    grid.innerHTML = html;
  }

  // ========== PRODUCT DETAIL ==========
  function renderProductDetail(productId) {
    console.log('🧾 renderProductDetail called:', productId);
    var allProds = load(KEYS.products, []);
    var p = null;
    for (var i = 0; i < allProds.length; i++) {
      if (String(allProds[i].id) === String(productId) && allProds[i].active) {
        p = allProds[i];
        break;
      }
    }

    if (!p) {
      toast('المنتج غير موجود', true);
      console.error('❌ Product not found:', productId);
      return false;
    }

    var content = document.getElementById('productDetailContent');
    if (!content) {
      console.error('❌ productDetailContent not found');
      toast('تعذر تحميل تفاصيل المنتج', true);
      return false;
    }

    var pid = escapeHtml(p.id);
    var pname = escapeHtml(p.name || 'منتج');
    var pdesc = escapeHtml(p.desc || '');
    var pimage = escapeHtml(safeUrl(p.image, placeholderImg(p.name)));
    content.innerHTML =
      '<div class="detail-hero-card" style="display:flex; gap:20px; padding:24px; background:#14131a; border-radius:14px; border:1px solid #2a2735; margin-bottom:20px; flex-wrap:wrap;">' +
      '<img src="' + pimage + '" alt="' + pname + '" style="width:120px; height:120px; border-radius:14px; object-fit:cover; background:#1c1b24;">' +
      '<div style="flex:1; min-width:200px;">' +
      '<span class="product-type" style="display:inline-block; background:rgba(139,92,246,0.12); color:#8b5cf6; padding:2px 12px; border-radius:6px; font-size:0.75rem;">' + escapeHtml(typeLabel(p.type)) + '</span>' +
      '<h1 style="margin:8px 0 4px; color:#f4f2f8; font-size:1.6rem;">' + pname + '</h1>' +
      '<p style="color:#9b96a8; margin:0 0 10px;">' + pdesc + '</p>' +
      '<div class="product-price" style="font-size:1.4rem; font-weight:700; color:#8b5cf6;">' + formatPrice(p.price) + '</div>' +
      (p.pricingNote ? '<div class="pricing-note" style="padding:8px 12px; background:rgba(139,92,246,0.08); border-radius:8px; margin-top:8px; color:#c4b5fd; font-size:0.85rem;">' + escapeHtml(p.pricingNote) + '</div>' : '') +
      '</div></div>' +
      '<div style="display:flex; gap:12px; flex-wrap:wrap;">' +
      '<div class="ux-detail-info-grid">' +
      '<div><strong>طريقة التنفيذ</strong><span>يتم التواصل معك بعد تأكيد الطلب</span></div>' +
      '<div><strong>المدة المتوقعة</strong><span>يبدأ التنفيذ بأقرب وقت ممكن</span></div>' +
      '<div><strong>المتابعة</strong><span>يمكنك متابعة حالة الطلب من حسابك</span></div>' +
      '<div><strong>الدعم</strong><span>تواصل مباشر عند الحاجة</span></div>' +
      '</div>' +
      '<div class="ux-detail-actions">' +
      '<button class="btn btn-primary" onclick="addToCart(\'' + pid + '\')" style="flex:1; padding:12px 24px; background:#8b5cf6; color:#fff; border:none; border-radius:10px; font-size:1rem; cursor:pointer;">🛒 أضف إلى السلة</button>' +
      '<button class="btn btn-secondary" onclick="openQuickOrder(\'' + pid + '\')" style="flex:1; padding:12px 24px; background:#1c1b24; color:#f4f2f8; border:1px solid #2a2735; border-radius:10px; font-size:1rem; cursor:pointer;">⚡ شراء مباشر</button>' +
      '</div></div>';
    return true;
  }

  window.openProductDetail = function(productId) {
    console.log('🛒 openProductDetail called:', productId);
    if (!renderProductDetail(productId)) return;
    window.showPage('product-detail', productId);
  };

  // ========== CART ==========
  window.addToCart = function(productId) {
    console.log('🛒 addToCart called:', productId);
    if (!currentUser) {
      toast('يجب تسجيل الدخول أولاً', true);
      showPage('login');
      return;
    }

    var allProds = load(KEYS.products, []);
    var p = null;
    for (var i = 0; i < allProds.length; i++) {
      if (String(allProds[i].id) === String(productId) && allProds[i].active) {
        p = allProds[i];
        break;
      }
    }
    if (!p) {
      toast('المنتج غير موجود', true);
      return;
    }

    var existing = null;
    for (var j = 0; j < cart.length; j++) {
      if (String(cart[j].productId) === String(productId)) {
        existing = cart[j];
        break;
      }
    }
    if (existing) {
      existing.qty += 1;
      existing.lineTotal = existing.qty * Number(p.price || 0);
    } else {
      cart.push({
        productId: p.id,
        qty: 1,
        name: p.name,
        price: Number(p.price || 0),
        lineTotal: Number(p.price || 0),
        image: p.image,
        serviceType: p.type
      });
    }
    save(KEYS.cart, cart);
    updateUI();
    toast('✅ تمت الإضافة إلى السلة');
  };

  window.clearCategoryFilters = function() {
    console.log('🧹 clearCategoryFilters called');
    categoryFilters.query = '';
    categoryFilters.sort = 'popular';
    var searchEl = document.getElementById('categorySearch');
    var sortEl = document.getElementById('categorySort');
    if (searchEl) searchEl.value = '';
    if (sortEl) sortEl.value = 'popular';
    var title = document.getElementById('categoryTitle');
    var hash = location.hash || '';
    var catId = hash.indexOf('category/') === 0 ? decodeURIComponent(hash.split('/')[1] || '') : '';
    if (catId) renderCategoryProducts(catId);
    if (title) title.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  function renderCart() {
    console.log('🛒 renderCart called');
    var empty = document.getElementById('cartEmpty');
    var content = document.getElementById('cartContent');
    if (!cart || cart.length === 0) {
      if (empty) empty.classList.remove('hidden');
      if (content) content.classList.add('hidden');
      return;
    }
    if (empty) empty.classList.add('hidden');
    if (content) content.classList.remove('hidden');

    var total = 0;
    var itemsEl = document.getElementById('cartItems');
    if (itemsEl) {
      var html = '';
      for (var i = 0; i < cart.length; i++) {
        var item = cart[i];
        var itemTotal = Number(item.lineTotal || item.price * item.qty);
        total += itemTotal;
        html += '<div class="cart-item" style="display:flex; gap:12px; background:#14131a; border:1px solid #2a2735; border-radius:10px; padding:12px; margin-bottom:8px; align-items:center; flex-wrap:wrap;">';
        html += '<img src="' + escapeHtml(safeUrl(item.image, placeholderImg(item.name))) + '" alt="' + escapeHtml(item.name) + '" style="width:60px; height:60px; border-radius:8px; object-fit:cover;">';
        html += '<div class="cart-item-info" style="flex:1; min-width:120px;">';
        html += '<h4 style="margin:0; font-size:0.9rem; color:#f4f2f8;">' + escapeHtml(item.name) + '</h4>';
        html += '<div class="product-price" style="font-size:0.9rem; font-weight:700; color:#8b5cf6;">' + formatPrice(itemTotal) + '</div>';
        html += '</div><div class="cart-item-actions" style="display:flex; gap:6px; align-items:center;">';
        html += '<button class="qty-btn" onclick="changeQty(' + i + ', -1)" style="width:30px; height:30px; border-radius:6px; border:1px solid #2a2735; background:#1c1b24; color:#f4f2f8; cursor:pointer;">−</button>';
        html += '<span style="min-width:24px; text-align:center;">' + Number(item.qty || 0) + '</span>';
        html += '<button class="qty-btn" onclick="changeQty(' + i + ', 1)" style="width:30px; height:30px; border-radius:6px; border:1px solid #2a2735; background:#1c1b24; color:#f4f2f8; cursor:pointer;">+</button>';
        html += '<button class="btn btn-danger btn-sm" onclick="removeFromCart(' + i + ')" style="padding:4px 10px; background:transparent; border:1px solid #9f1239; color:#9f1239; border-radius:6px; cursor:pointer;">حذف</button>';
        html += '</div></div>';
      }
      itemsEl.innerHTML = html;
    }
    var totalEl = document.getElementById('cartTotal');
    if (totalEl) totalEl.textContent = formatPrice(total);
  }

  function renderUserOrders() {
    console.log('📜 renderUserOrders called');
    var page = document.getElementById('page-orders');
    if (!page) return;
    var content = document.getElementById('userOrdersContent');
    if (!content) return;
    if (!currentUser) {
      content.innerHTML = '<div class="ux-login-prompt"><strong>سجّل الدخول لمشاهدة طلباتك</strong><span>ستظهر هنا كل طلباتك وحالات تنفيذها.</span><button class="btn btn-primary" onclick="showPage(\'login\')">تسجيل الدخول</button></div>';
      return;
    }

    var orders = load(KEYS.orders, []).filter(function(order) {
      return order.username === currentUser.username;
    }).reverse();
    if (!orders.length) {
      content.innerHTML = '<div class="ux-login-prompt"><strong>لا توجد طلبات حتى الآن</strong><span>ابدأ باختيار خدمة من الأقسام.</span><button class="btn btn-primary" onclick="showPage(\'categories\')">تصفح الخدمات</button></div>';
      return;
    }

    var html = '';
    for (var i = 0; i < orders.length; i++) {
      var order = orders[i];
      var status = order.status === 'approved' ? 'مكتمل' : order.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة';
      var statusClass = order.status === 'approved' ? 'is-success' : order.status === 'rejected' ? 'is-danger' : 'is-pending';
      var itemNames = (order.items || []).map(function(item) { return item.name; }).join('، ');
      html += '<article class="ux-order-card">' +
        '<div class="ux-order-card-head"><strong>' + escapeHtml(order.id) + '</strong><span class="ux-status ' + statusClass + '">' + status + '</span></div>' +
        '<p>' + escapeHtml(itemNames || 'خدمة مباشرة') + '</p>' +
        '<div class="ux-order-meta"><span>' + new Date(order.createdAt).toLocaleDateString('ar-SY') + '</span><strong>' + formatPrice(order.total || 0) + '</strong></div>' +
        '<div class="ux-order-timeline"><span class="done">تم إرسال الطلب</span><span class="' + (order.status === 'approved' ? 'done' : '') + '">' + (order.status === 'approved' ? 'تم التنفيذ' : 'قيد المتابعة') + '</span></div>' +
        '</article>';
    }
    content.innerHTML = html;
  }

  window.changeQty = function(idx, delta) {
    console.log('🔢 changeQty called:', idx, delta);
    if (idx < 0 || idx >= cart.length) return;
    cart[idx].qty += delta;
    if (cart[idx].qty < 1) cart.splice(idx, 1);
    else cart[idx].lineTotal = cart[idx].qty * Number(cart[idx].price || 0);
    save(KEYS.cart, cart);
    updateUI();
    renderCart();
  };

  window.removeFromCart = function(idx) {
    console.log('🗑️ removeFromCart called:', idx);
    if (idx < 0 || idx >= cart.length) return;
    cart.splice(idx, 1);
    save(KEYS.cart, cart);
    updateUI();
    renderCart();
  };

  // ========== QUICK ORDER ==========
  window.openQuickOrder = function(productId) {
    console.log('⚡ openQuickOrder called:', productId);
    if (!currentUser) {
      toast('يجب تسجيل الدخول أولاً', true);
      showPage('login');
      return;
    }

    var allProds = load(KEYS.products, []);
    var p = null;
    for (var i = 0; i < allProds.length; i++) {
      if (String(allProds[i].id) === String(productId) && allProds[i].active) {
        p = allProds[i];
        break;
      }
    }
    if (!p) {
      toast('المنتج غير موجود', true);
      return;
    }

    var modal = document.getElementById('quickOrderModal');
    if (!modal) {
      toast('حدث خطأ في النافذة', true);
      return;
    }

    var titleEl = document.getElementById('quickOrderTitle');
    var summaryEl = document.getElementById('quickOrderSummary');
    var totalEl = document.getElementById('quickOrderTotal');
    var formEl = document.getElementById('quickOrderForm');
    if (titleEl) titleEl.textContent = p.name;
    if (summaryEl) summaryEl.textContent = p.pricingNote || p.desc || 'أدخل البيانات المطلوبة';
    if (totalEl) totalEl.textContent = formatPrice(p.price);
    if (formEl) {
      formEl.innerHTML =
        '<div class="form-group"><label>رقم واتساب العميل <span class="required">*</span></label>' +
        '<input type="tel" id="quickWhatsapp" placeholder="مثال: +9639xxxxxxxx" required style="width:100%; padding:10px; border-radius:8px; border:1px solid #2a2735; background:#1c1b24; color:#f4f2f8;"></div>' +
        '<div class="form-group"><label>رابط الحساب <span class="required">*</span></label>' +
        '<input type="url" id="quickTarget" placeholder="https://instagram.com/..." required style="width:100%; padding:10px; border-radius:8px; border:1px solid #2a2735; background:#1c1b24; color:#f4f2f8;"></div>' +
        '<div class="form-group"><label>ملاحظات إضافية</label>' +
        '<textarea id="quickNotes" rows="3" placeholder="أي ملاحظة للإدمن" style="width:100%; padding:10px; border-radius:8px; border:1px solid #2a2735; background:#1c1b24; color:#f4f2f8;"></textarea></div>' +
        '<input type="hidden" id="quickProductId" value="' + escapeHtml(p.id) + '">';
    }
    modal.classList.remove('hidden');
  };

  window.closeQuickOrder = function() {
    console.log('✖️ closeQuickOrder called');
    var modal = document.getElementById('quickOrderModal');
    if (modal) modal.classList.add('hidden');
  };

  window.submitQuickOrder = function() {
    console.log('✅ submitQuickOrder called');
    if (!currentUser) return;
    var whatsappEl = document.getElementById('quickWhatsapp');
    var targetEl = document.getElementById('quickTarget');
    var notesEl = document.getElementById('quickNotes');
    var productEl = document.getElementById('quickProductId');
    var whatsapp = whatsappEl ? whatsappEl.value.trim() : '';
    var target = targetEl ? targetEl.value.trim() : '';
    var notes = notesEl ? notesEl.value.trim() : '';
    var productId = productEl ? productEl.value : '';

    if (!whatsapp || whatsapp.length < 6) {
      toast('رقم واتساب العميل إجباري', true);
      return;
    }
    if (!target) {
      toast('أدخل رابط الحساب', true);
      return;
    }

    var allProds = load(KEYS.products, []);
    var p = null;
    for (var i = 0; i < allProds.length; i++) {
      if (String(allProds[i].id) === String(productId) && allProds[i].active) {
        p = allProds[i];
        break;
      }
    }
    if (!p) {
      toast('المنتج غير موجود', true);
      return;
    }

    var total = Number(p.price || 0);
    if ((currentUser.balance || 0) < total) {
      toast('رصيدك غير كافٍ. يرجى شحن المحفظة أولاً', true);
      closeQuickOrder();
      showPage('wallet');
      return;
    }

    currentUser.balance -= total;
    currentUser.whatsapp = whatsapp;
    saveUser(currentUser);
    var order = {
      id: uid('ord'),
      username: currentUser.username,
      whatsapp: whatsapp,
      total: total,
      status: 'pending',
      createdAt: new Date().toISOString(),
      items: [{ productId: p.id, name: p.name, serviceType: p.type, qty: 1, price: total, targetUrl: target, notes: notes }]
    };
    var orders = load(KEYS.orders, []);
    orders.push(order);
    save(KEYS.orders, orders);
    closeQuickOrder();
    updateUI();
    var successMsg = document.getElementById('orderSuccessMsg');
    if (successMsg) successMsg.textContent = 'تم إرسال الطلب ' + order.id + ' بنجاح — المجموع: ' + formatPrice(total);
    showPage('order-success');
  };

  // ========== CHECKOUT ==========
  window.checkout = function() {
    console.log('💳 checkout called');
    if (!currentUser) {
      toast('يجب تسجيل الدخول أولاً', true);
      showPage('login');
      return;
    }
    if (!cart || cart.length === 0) {
      toast('السلة فارغة', true);
      return;
    }

    var whatsappEl = document.getElementById('orderWhatsapp');
    var whatsapp = whatsappEl ? whatsappEl.value.trim() : '';
    if (!whatsapp || whatsapp.length < 6) {
      toast('رقم واتساب إجباري', true);
      if (whatsappEl) whatsappEl.focus();
      return;
    }

    var total = 0;
    for (var i = 0; i < cart.length; i++) total += Number(cart[i].lineTotal || cart[i].price * cart[i].qty);
    if ((currentUser.balance || 0) < total) {
      toast('رصيدك غير كافٍ. يرجى شحن المحفظة أولاً', true);
      showPage('wallet');
      return;
    }

    currentUser.balance -= total;
    currentUser.whatsapp = whatsapp;
    saveUser(currentUser);
    var order = {
      id: uid('ord'),
      username: currentUser.username,
      whatsapp: whatsapp,
      items: cart.slice(),
      total: total,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    var orders = load(KEYS.orders, []);
    orders.push(order);
    save(KEYS.orders, orders);

    var products = load(KEYS.products, []);
    for (var j = 0; j < cart.length; j++) {
      for (var k = 0; k < products.length; k++) {
        if (products[k].id === cart[j].productId) {
          products[k].sales = (products[k].sales || 0) + 1;
          break;
        }
      }
    }
    save(KEYS.products, products);
    cart = [];
    save(KEYS.cart, cart);
    updateUI();
    var successMsg = document.getElementById('orderSuccessMsg');
    if (successMsg) successMsg.textContent = 'تم إرسال الطلب ' + order.id + ' بنجاح — المجموع: ' + formatPrice(total);
    showPage('order-success');
  };

  function saveUser(user) {
    var users = load(KEYS.users, []);
    var found = false;
    for (var i = 0; i < users.length; i++) {
      if (users[i].username === user.username) {
        users[i] = user;
        found = true;
        break;
      }
    }
    if (!found) users.push(user);
    save(KEYS.users, users);
    currentUser = user;
    save(KEYS.currentUser, currentUser);
  }

  // ========== AUTH ==========
  window.handleAuth = async function(e) {
    console.log('🔐 handleAuth called');
    if (e && e.preventDefault) e.preventDefault();
    var usernameEl = document.getElementById('authUsername');
    var emailEl = document.getElementById('authEmail');
    var passwordEl = document.getElementById('authPassword');
    var confirmEl = document.getElementById('authPasswordConfirm');
    var username = usernameEl ? usernameEl.value.trim() : '';
    var email = emailEl ? emailEl.value.trim().toLowerCase() : '';
    var password = passwordEl ? passwordEl.value : '';
    var passwordConfirm = confirmEl ? confirmEl.value : '';
    var codeBox = document.getElementById('verificationCodeBox');
    var retryBox = document.getElementById('verificationRetryBox');
    if (codeBox) codeBox.classList.add('hidden');
    if (retryBox) retryBox.classList.add('hidden');

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      adminLoggedIn = true;
      sessionStorage.setItem(KEYS.adminSession, '1');
      toast('مرحباً أدمن');
      showPage('admin');
      return;
    }
    if (!username) { toast('اسم المستخدم مطلوب', true); return; }
    if (!email) { toast('البريد الإلكتروني مطلوب', true); return; }
    if (password.length < 4) { toast('كلمة المرور 4 أحرف على الأقل', true); return; }
    if (password !== passwordConfirm) { toast('كلمتا المرور غير متطابقتين', true); return; }

    var users = load(KEYS.users, []);
    var user = null;
    for (var i = 0; i < users.length; i++) {
      if (users[i].username === username || users[i].email === email) {
        user = users[i];
        break;
      }
    }
    if (user) {
      if (user.password !== password) {
        toast('كلمة المرور غير صحيحة', true);
        return;
      }
      currentUser = { username: user.username, email: user.email, balance: user.balance || 0 };
      save(KEYS.currentUser, currentUser);
      updateUI();
      toast('مرحباً ' + username);
      showPage('home');
      return;
    }

    var pending = load(KEYS.pendingUsers, []);
    var pendingUser = null;
    for (var j = 0; j < pending.length; j++) {
      if (pending[j].username === username || pending[j].email === email) {
        pendingUser = pending[j];
        break;
      }
    }
    if (pendingUser) {
      if (pendingUser.password !== password) {
        toast('كلمة المرور غير صحيحة', true);
        return;
      }
      pendingVerificationUser = pendingUser;
      if (codeBox) codeBox.classList.remove('hidden');
      if (retryBox) retryBox.classList.remove('hidden');
      var retryMessage = document.getElementById('verificationRetryMessage');
      if (retryMessage) retryMessage.textContent = '📧 تم إرسال رمز التفعيل إلى ' + email + '. أدخل الرمز المكوّن من 6 أرقام.';
      toast('📧 أدخل رمز التفعيل المرسل إلى بريدك الإلكتروني');
      return;
    }

    var newUser = { username: username, email: email, password: password };
    try {
      toast('📧 جاري إرسال رمز التفعيل...');
      await window.sendVerificationEmail(newUser);
      if (codeBox) codeBox.classList.remove('hidden');
      if (retryBox) retryBox.classList.remove('hidden');
      var retryMessage2 = document.getElementById('verificationRetryMessage');
      if (retryMessage2) retryMessage2.textContent = '✅ تم إرسال رمز التفعيل إلى ' + email + '. أدخل الرمز المكوّن من 6 أرقام.';
      toast('✅ تم إرسال رمز التفعيل إلى بريدك الإلكتروني');
    } catch(e) {
      console.error('Send error:', e);
      toast('❌ فشل إرسال البريد: ' + e.message, true);
    }
  };

  window.logout = function() {
    console.log('🚪 logout called');
    currentUser = null;
    localStorage.removeItem(KEYS.currentUser);
    updateUI();
    toast('تم تسجيل الخروج');
    showPage('home');
  };

  // ========== WALLET ==========
  window.showTopUpModal = function() {
    console.log('💰 showTopUpModal called');
    if (!currentUser) {
      toast('يجب تسجيل الدخول أولاً', true);
      showPage('login');
      return;
    }
    var section = document.getElementById('topUpSection');
    if (section) section.classList.remove('hidden');
  };

  window.submitTopUp = function(e) {
    console.log('💵 submitTopUp called');
    if (e && e.preventDefault) e.preventDefault();
    if (!currentUser) return;
    var txNumberEl = document.getElementById('txNumber');
    var amountEl = document.getElementById('txAmount');
    var currencyEl = document.getElementById('txCurrency');
    var txNumber = txNumberEl ? txNumberEl.value.trim() : '';
    var amount = amountEl ? Number(amountEl.value) : 0;
    var currency = currencyEl ? currencyEl.value : 'USD';
    if (!txNumber || amount < 1) {
      toast('يرجى إدخال بيانات صحيحة', true);
      return;
    }
    var topups = load(KEYS.topups, []);
    topups.push({ id: uid('top'), username: currentUser.username, txNumber: txNumber, amount: amount, currency: currency, status: 'pending', createdAt: new Date().toISOString() });
    save(KEYS.topups, topups);
    var form = document.getElementById('topUpForm');
    var section = document.getElementById('topUpSection');
    if (form) form.reset();
    if (section) section.classList.add('hidden');
    toast('تم استلام طلبك، سيتم مراجعته قريباً ✓');
  };

  // ========== ADMIN LOGIN / SUPPORTING INLINE HANDLERS ==========
  window.adminLogin = function(e) {
    console.log('🔑 adminLogin called');
    if (e && e.preventDefault) e.preventDefault();
    var userEl = document.getElementById('adminUser');
    var passEl = document.getElementById('adminPass');
    var username = userEl ? userEl.value.trim() : '';
    var password = passEl ? passEl.value : '';
    if (username !== ADMIN_USER || password !== ADMIN_PASS) {
      toast('بيانات دخول الإدمن غير صحيحة', true);
      return;
    }
    adminLoggedIn = true;
    sessionStorage.setItem(KEYS.adminSession, '1');
    toast('تم تسجيل دخول الإدمن');
    showPage('admin');
  };

  window.adminLogout = function() {
    console.log('🚪 adminLogout called');
    adminLoggedIn = false;
    sessionStorage.removeItem(KEYS.adminSession);
    toast('تم تسجيل الخروج من لوحة التحكم');
    showPage('home');
  };

  window.closeOrderDetails = function() {
    console.log('✖️ closeOrderDetails called');
    var modal = document.getElementById('orderDetailsModal');
    if (modal) modal.classList.add('hidden');
  };

  window.copyShamCode = function() {
    console.log('📋 copyShamCode called');
    var codeEl = document.getElementById('shamCode');
    var code = codeEl ? codeEl.textContent.trim() : '';
    if (!code) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(function() {
        toast('تم نسخ بيانات المحفظة');
      }).catch(function() {
        toast('تعذر النسخ تلقائياً، انسخ النص يدوياً', true);
      });
    } else {
      toast('انسخ النص يدوياً: ' + code);
    }
  };

  window.saveSiteSettings = function() {
    console.log('⚙️ saveSiteSettings called');
    var settings = load(KEYS.settings, {});
    var fields = {
      walletImage: 'settingWalletImage',
      adminPhone: 'settingAdminPhone',
      telegram: 'settingTelegram',
      channel: 'settingChannel',
      ownerPhoto: 'settingOwnerPhoto',
      ownerName: 'settingOwnerName',
      ownerBio: 'settingOwnerBio',
      loaderLogo: 'settingLoaderLogo',
      loaderSeconds: 'settingLoaderSeconds',
      emailjsPublicKey: 'settingEmailjsPublicKey',
      emailjsServiceId: 'settingEmailjsServiceId',
      emailjsTemplateVerifyId: 'settingEmailjsTemplateVerifyId',
      verificationExpiry: 'settingVerificationExpiry'
    };
    for (var key in fields) {
      var field = document.getElementById(fields[key]);
      if (field) settings[key] = field.value;
    }
    var catImage = document.getElementById('catImage');
    save(KEYS.settings, settings);
    renderAbout();
    if (settings.walletImage) {
      var walletImage = document.getElementById('walletPaymentImage');
      if (walletImage) walletImage.src = safeUrl(settings.walletImage, '');
    }
    toast('تم حفظ إعدادات الموقع');
  };

  window.addManualBalance = function() {
    console.log('💳 addManualBalance called');
    var userEl = document.getElementById('manualUser');
    var amountEl = document.getElementById('manualAmount');
    var username = userEl ? userEl.value.trim() : '';
    var amount = amountEl ? Number(amountEl.value) : 0;
    if (!username || amount < 1) {
      toast('أدخل اسم المستخدم والمبلغ بشكل صحيح', true);
      return;
    }
    var users = load(KEYS.users, []);
    var found = false;
    for (var i = 0; i < users.length; i++) {
      if (users[i].username === username) {
        users[i].balance = Number(users[i].balance || 0) + amount;
        found = true;
        break;
      }
    }
    if (!found) {
      toast('المستخدم غير موجود', true);
      return;
    }
    save(KEYS.users, users);
    if (currentUser && currentUser.username === username) {
      currentUser.balance = users[i].balance;
      save(KEYS.currentUser, currentUser);
      updateUI();
    }
    if (userEl) userEl.value = '';
    if (amountEl) amountEl.value = '';
    renderAdminUsers();
    toast('تمت إضافة الرصيد');
  };

  // ========== ADMIN ==========
  window.switchAdminTab = function(tab) {
    console.log('📊 switchAdminTab called:', tab);
    var contents = document.querySelectorAll('.admin-tab-content');
    for (var i = 0; i < contents.length; i++) contents[i].classList.remove('active');
    var btns = document.querySelectorAll('.tab-btn');
    for (var j = 0; j < btns.length; j++) btns[j].classList.remove('active');
    var content = document.getElementById('admin-' + tab);
    if (content) content.classList.add('active');
    var btn = document.querySelector('.tab-btn[data-tab="' + tab + '"]');
    if (btn) btn.classList.add('active');
    if (tab === 'stats') renderStats();
    if (tab === 'categories') renderAdminCategories();
    if (tab === 'products') renderAdminProducts();
    if (tab === 'topups') renderAdminTopups();
    if (tab === 'orders') renderAdminOrders();
    if (tab === 'users') renderAdminUsers();
    if (tab === 'settings') loadSiteSettingsForm();
  };

  function renderStats() {
    var products = load(KEYS.products, []);
    var orders = load(KEYS.orders, []);
    var topups = load(KEYS.topups, []);
    var users = load(KEYS.users, []);
    var grid = document.getElementById('statsGrid');
    if (!grid) return;
    grid.innerHTML =
      '<div class="stat-card"><h4>المنتجات</h4><p>' + products.length + '</p></div>' +
      '<div class="stat-card"><h4>الطلبات</h4><p>' + orders.length + '</p></div>' +
      '<div class="stat-card"><h4>طلبات الشحن</h4><p>' + topups.length + '</p></div>' +
      '<div class="stat-card"><h4>المستخدمين</h4><p>' + users.length + '</p></div>';
  }

  function renderAdminCategories() {
    var cats = load(KEYS.categories, []).sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
    var tbody = document.querySelector('#catsTable tbody');
    if (!tbody) return;
    var html = '';
    for (var i = 0; i < cats.length; i++) {
      var c = cats[i];
      html += '<tr><td>' + escapeHtml(c.name) + '</td><td>' + (c.image ? '✓' : '—') + '</td><td>' + c.order + '</td><td>' +
        '<button class="btn btn-sm btn-secondary" onclick="editCategory(\'' + escapeHtml(c.id) + '\')">تعديل</button>' +
        '<button class="btn btn-sm btn-danger" onclick="deleteCategory(\'' + escapeHtml(c.id) + '\')">حذف</button></td></tr>';
    }
    tbody.innerHTML = html;
  }

  window.editCategory = function(id) {
    console.log('✏️ editCategory called:', id);
    var cats = load(KEYS.categories, []);
    var c = null;
    for (var i = 0; i < cats.length; i++) {
      if (cats[i].id === id) { c = cats[i]; break; }
    }
    if (!c) return;
    var newName = prompt('اسم القسم الجديد:', c.name);
    if (newName !== null) c.name = newName.trim() || c.name;
    save(KEYS.categories, cats);
    renderAdminCategories();
    toast('تم التعديل');
  };

  window.deleteCategory = function(id) {
    console.log('🗑️ deleteCategory called:', id);
    if (!confirm('حذف القسم؟')) return;
    var cats = load(KEYS.categories, []);
    var newCats = [];
    for (var i = 0; i < cats.length; i++) if (cats[i].id !== id) newCats.push(cats[i]);
    save(KEYS.categories, newCats);
    renderAdminCategories();
    toast('تم الحذف');
  };

  window.addCategory = function() {
    console.log('➕ addCategory called');
    var nameEl = document.getElementById('catName');
    var imageEl = document.getElementById('catImage');
    var name = nameEl ? nameEl.value.trim() : '';
    if (!name) { toast('أدخل اسم القسم', true); return; }
    var cats = load(KEYS.categories, []);
    cats.push({ id: uid('cat'), name: name, image: imageEl ? imageEl.value.trim() : '', order: cats.length + 1 });
    save(KEYS.categories, cats);
    if (nameEl) nameEl.value = '';
    if (imageEl) imageEl.value = '';
    var form = document.getElementById('addCategoryForm');
    if (form) form.classList.add('hidden');
    renderAdminCategories();
    toast('تمت الإضافة');
  };

  function renderAdminProducts() {
    var products = load(KEYS.products, []);
    var cats = load(KEYS.categories, []);
    var tbody = document.querySelector('#prodsTable tbody');
    if (!tbody) return;
    var html = '';
    for (var i = 0; i < products.length; i++) {
      var p = products[i];
      var catName = '—';
      for (var j = 0; j < cats.length; j++) {
        if (cats[j].id === p.categoryId) { catName = cats[j].name; break; }
      }
      html += '<tr><td>' + escapeHtml(p.name) + '</td><td>' + escapeHtml(catName) + '</td><td>' + formatPrice(p.price) + '</td><td>' + escapeHtml(typeLabel(p.type)) + '</td><td>' + (p.active ? '🟢 نشط' : '🔴 متوقف') + '</td><td>' +
        '<button class="btn btn-sm btn-secondary" onclick="toggleProduct(\'' + escapeHtml(p.id) + '\')">تغيير</button>' +
        '<button class="btn btn-sm btn-danger" onclick="deleteProduct(\'' + escapeHtml(p.id) + '\')">حذف</button></td></tr>';
    }
    tbody.innerHTML = html;
  }

  window.toggleProduct = function(id) {
    console.log('🔁 toggleProduct called:', id);
    var products = load(KEYS.products, []);
    for (var i = 0; i < products.length; i++) {
      if (products[i].id === id) { products[i].active = !products[i].active; break; }
    }
    save(KEYS.products, products);
    renderAdminProducts();
  };

  window.deleteProduct = function(id) {
    console.log('🗑️ deleteProduct called:', id);
    if (!confirm('حذف المنتج؟')) return;
    var products = load(KEYS.products, []);
    var newProds = [];
    for (var i = 0; i < products.length; i++) if (products[i].id !== id) newProds.push(products[i]);
    save(KEYS.products, newProds);
    renderAdminProducts();
    toast('تم الحذف');
  };

  window.addProduct = function() {
    console.log('➕ addProduct called');
    var nameEl = document.getElementById('prodName');
    var priceEl = document.getElementById('prodPrice');
    var catEl = document.getElementById('prodCategory');
    var typeEl = document.getElementById('prodType');
    var name = nameEl ? nameEl.value.trim() : '';
    var price = priceEl ? Number(priceEl.value) : 0;
    var categoryId = catEl ? catEl.value : '';
    var type = typeEl ? typeEl.value : 'other';
    if (!name || price < 0) { toast('بيانات غير مكتملة', true); return; }
    var products = load(KEYS.products, []);
    var descEl = document.getElementById('prodDesc');
    var unitEl = document.getElementById('prodUnitSize');
    var imageEl = document.getElementById('prodImage');
    var noteEl = document.getElementById('prodPricingNote');
    var activeEl = document.getElementById('prodActive');
    products.push({
      id: uid('p'),
      name: name,
      desc: descEl ? descEl.value.trim() : '',
      price: price,
      unitSize: unitEl ? Number(unitEl.value) || 1000 : 1000,
      image: imageEl ? imageEl.value.trim() : '',
      categoryId: categoryId,
      type: type,
      active: activeEl ? activeEl.checked : true,
      sales: 0,
      pricingNote: noteEl ? noteEl.value.trim() : ''
    });
    save(KEYS.products, products);
    var form = document.getElementById('addProductForm');
    if (form) form.classList.add('hidden');
    renderAdminProducts();
    toast('تمت إضافة المنتج');
  };

  window.showAddProductForm = function() {
    console.log('➕ showAddProductForm called');
    var cats = load(KEYS.categories, []);
    var sel = document.getElementById('prodCategory');
    if (sel) {
      var html = '';
      for (var i = 0; i < cats.length; i++) html += '<option value="' + escapeHtml(cats[i].id) + '">' + escapeHtml(cats[i].name) + '</option>';
      sel.innerHTML = html;
    }
    var form = document.getElementById('addProductForm');
    if (form) form.classList.remove('hidden');
  };

  window.hideAddProductForm = function() {
    console.log('➖ hideAddProductForm called');
    var form = document.getElementById('addProductForm');
    if (form) form.classList.add('hidden');
  };

  window.showAddCategoryForm = function() {
    console.log('➕ showAddCategoryForm called');
    var form = document.getElementById('addCategoryForm');
    if (form) form.classList.remove('hidden');
  };

  window.hideAddCategoryForm = function() {
    console.log('➖ hideAddCategoryForm called');
    var form = document.getElementById('addCategoryForm');
    if (form) form.classList.add('hidden');
  };

  function renderAdminTopups() {
    var topups = load(KEYS.topups, []).slice().reverse();
    var tbody = document.querySelector('#topupsTable tbody');
    if (!tbody) return;
    var html = '';
    for (var i = 0; i < topups.length; i++) {
      var t = topups[i];
      html += '<tr><td>' + escapeHtml(t.username) + '</td><td>' + escapeHtml(t.txNumber) + '</td><td>' + t.amount + '</td><td>' + escapeHtml(t.currency) + '</td><td>' + (t.status === 'pending' ? '⏳ قيد المراجعة' : t.status === 'approved' ? '✅ مقبول' : '❌ مرفوض') + '</td><td>' + new Date(t.createdAt).toLocaleString('ar') + '</td><td>' +
        (t.status === 'pending' ? '<button class="btn btn-sm btn-primary" onclick="approveTopup(\'' + escapeHtml(t.id) + '\')">قبول</button><button class="btn btn-sm btn-danger" onclick="rejectTopup(\'' + escapeHtml(t.id) + '\')">رفض</button>' : '—') +
        '</td></tr>';
    }
    tbody.innerHTML = html || '<tr><td colspan="8">لا توجد طلبات</td></tr>';
  }

  window.approveTopup = function(id) {
    console.log('✅ approveTopup called:', id);
    var topups = load(KEYS.topups, []);
    var t = null;
    for (var i = 0; i < topups.length; i++) if (topups[i].id === id) { t = topups[i]; break; }
    if (!t || t.status !== 'pending') return;
    t.status = 'approved';
    var users = load(KEYS.users, []);
    for (var j = 0; j < users.length; j++) {
      if (users[j].username === t.username) {
        var add = Number(t.amount);
        if (t.currency === 'SYP') add = Math.round(add / 10000);
        users[j].balance = (users[j].balance || 0) + add;
        break;
      }
    }
    save(KEYS.users, users);
    save(KEYS.topups, topups);
    renderAdminTopups();
    toast('تم قبول الطلب وإضافة الرصيد');
  };

  window.rejectTopup = function(id) {
    console.log('❌ rejectTopup called:', id);
    var topups = load(KEYS.topups, []);
    for (var i = 0; i < topups.length; i++) if (topups[i].id === id) { topups[i].status = 'rejected'; break; }
    save(KEYS.topups, topups);
    renderAdminTopups();
    toast('تم رفض الطلب');
  };

  function renderAdminOrders() {
    var orders = load(KEYS.orders, []).slice().reverse();
    var tbody = document.querySelector('#ordersTable tbody');
    if (!tbody) return;
    var html = '';
    for (var i = 0; i < orders.length; i++) {
      var o = orders[i];
      html += '<tr><td><strong>' + escapeHtml(o.id) + '</strong></td><td>' + escapeHtml(o.username || '—') + '</td><td>' + escapeHtml(o.whatsapp || '—') + '</td><td>' + (o.items ? o.items.length + ' خدمة' : '—') + '</td><td>' + formatPrice(o.total || 0) + '</td><td>' + (o.status === 'pending' ? '⏳ قيد المراجعة' : '✅ منفذ') + '</td><td>' + new Date(o.createdAt).toLocaleString('ar') + '</td><td>' +
        (o.status === 'pending' ? '<button class="btn btn-sm btn-primary" onclick="completeOrder(\'' + escapeHtml(o.id) + '\')">تم التنفيذ</button>' : '') +
        '</td></tr>';
    }
    tbody.innerHTML = html || '<tr><td colspan="8">لا توجد طلبات</td></tr>';
  }

  window.completeOrder = function(id) {
    console.log('✅ completeOrder called:', id);
    var orders = load(KEYS.orders, []);
    for (var i = 0; i < orders.length; i++) if (orders[i].id === id) { orders[i].status = 'approved'; break; }
    save(KEYS.orders, orders);
    renderAdminOrders();
    toast('تم تحديث حالة الطلب');
  };

  function renderAdminUsers() {
    var users = load(KEYS.users, []);
    var pending = load(KEYS.pendingUsers, []);
    var tbody = document.querySelector('#usersTable tbody');
    if (!tbody) return;
    var html = '';
    for (var i = 0; i < users.length; i++) {
      var u = users[i];
      html += '<tr><td>' + escapeHtml(u.username) + '</td><td>' + escapeHtml(u.email || '—') + '</td><td>' + formatPrice(u.balance || 0) + '</td><td>✅ مفعل</td><td>' + (u.createdAt ? new Date(u.createdAt).toLocaleDateString('ar') : '—') + '</td></tr>';
    }
    for (var j = 0; j < pending.length; j++) {
      var pu = pending[j];
      html += '<tr><td>' + escapeHtml(pu.username) + '</td><td>' + escapeHtml(pu.email || '—') + '</td><td>' + formatPrice(0) + '</td><td>⏳ غير مفعل</td><td>' + (pu.createdAt ? new Date(pu.createdAt).toLocaleDateString('ar') : '—') + '</td></tr>';
    }
    tbody.innerHTML = html || '<tr><td colspan="5">لا يوجد مستخدمون</td></tr>';
  }

  function loadSiteSettingsForm() {
    var settings = load(KEYS.settings, {});
    var fields = {
      walletImage: 'settingWalletImage',
      adminPhone: 'settingAdminPhone',
      telegram: 'settingTelegram',
      channel: 'settingChannel',
      ownerPhoto: 'settingOwnerPhoto',
      ownerName: 'settingOwnerName',
      ownerBio: 'settingOwnerBio',
      loaderLogo: 'settingLoaderLogo',
      loaderSeconds: 'settingLoaderSeconds',
      emailjsPublicKey: 'settingEmailjsPublicKey',
      emailjsServiceId: 'settingEmailjsServiceId',
      emailjsTemplateVerifyId: 'settingEmailjsTemplateVerifyId',
      verificationExpiry: 'settingVerificationExpiry'
    };
    for (var key in fields) {
      var field = document.getElementById(fields[key]);
      if (field && settings[key] != null) field.value = settings[key];
    }
  }

  // ========== ABOUT ==========
  function renderAbout() {
    console.log('ℹ️ renderAbout called');
    var settings = load(KEYS.settings, {});
    var photo = document.getElementById('ownerPhoto');
    if (photo) photo.src = safeUrl(settings.ownerPhoto, placeholderImg('MOOHAMED'));
    var name = document.getElementById('ownerName');
    if (name) name.textContent = settings.ownerName || 'MOOHAMED || IDLEB X';
    var bio = document.getElementById('ownerBio');
    if (bio) bio.textContent = settings.ownerBio || 'صاحب ومشرف متجر IDLEB STORE';
    var phone = document.getElementById('ownerPhone');
    var telegram = document.getElementById('ownerTelegram');
    var channel = document.getElementById('ownerChannel');
    if (phone && settings.adminPhone) phone.href = 'tel:' + settings.adminPhone;
    if (telegram && settings.telegram) telegram.href = settings.telegram;
    if (channel && settings.channel) channel.href = settings.channel;
    var walletImage = document.getElementById('walletPaymentImage');
    if (walletImage && settings.walletImage) walletImage.src = safeUrl(settings.walletImage, '');
  }

  // ========== UX / DESIGN ENHANCEMENTS ==========
  function enhanceStoreExperience() {
    console.log('✨ enhanceStoreExperience called');

    if (!document.getElementById('idlebUxStyles')) {
      var style = document.createElement('style');
      style.id = 'idlebUxStyles';
      style.textContent =
        '.ux-trust-strip{max-width:1180px;margin:-28px auto 0;padding:0 1.5rem;position:relative;z-index:4;display:grid;grid-template-columns:repeat(4,1fr);gap:12px}' +
        '.ux-trust-card{padding:17px 16px;border:1px solid var(--border);border-radius:16px;background:linear-gradient(145deg,var(--bg-card),var(--bg-elevated));box-shadow:var(--shadow-sm);text-align:center}' +
        '.ux-trust-card strong{display:block;color:var(--text);font-size:.93rem}.ux-trust-card span{display:block;margin-top:4px;color:var(--text-muted);font-size:.75rem}' +
        '.ux-trust-icon{display:grid;place-items:center;width:34px;height:34px;margin:0 auto 8px;border-radius:11px;background:var(--primary-soft);color:#c4b5fd;font-size:1.1rem}' +
        '.ux-how-section{max-width:1180px;margin:0 auto;padding:3rem 1.5rem 1rem}.ux-how-head{text-align:center;margin-bottom:1.6rem}.ux-how-head h2{margin-bottom:.45rem;font-size:1.55rem}.ux-how-head p{color:var(--text-muted);font-size:.9rem}' +
        '.ux-how-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.ux-how-card{position:relative;padding:22px;border:1px solid var(--border);border-radius:16px;background:var(--bg-card)}.ux-how-number{display:grid;place-items:center;width:36px;height:36px;margin-bottom:13px;border-radius:12px;background:linear-gradient(135deg,var(--primary),var(--primary-dark));color:#fff;font-weight:900}.ux-how-card h3{font-size:1rem;margin-bottom:5px}.ux-how-card p{color:var(--text-muted);font-size:.82rem;line-height:1.7}' +
        '.ux-category-tools{display:flex;align-items:center;gap:10px;margin:-.45rem 0 1.5rem;padding:12px;border:1px solid var(--border);border-radius:14px;background:var(--bg-card)}.ux-category-tools input,.ux-category-tools select{min-height:42px;border:1px solid var(--border-light);border-radius:10px;background:var(--bg-elevated);color:var(--text);font-family:inherit;padding:0 12px;outline:none}.ux-category-tools input{flex:1}.ux-category-tools input:focus,.ux-category-tools select:focus{border-color:var(--primary);box-shadow:0 0 0 3px var(--primary-soft)}' +
        '.ux-product-badge{display:inline-block;position:absolute;z-index:2;margin:10px;padding:4px 9px;border-radius:999px;background:var(--primary);color:#fff;font-size:.68rem;font-weight:800}.product-card{position:relative}' +
        '.ux-no-results,.ux-login-prompt{display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;min-height:190px;padding:24px;border:1px dashed var(--border-light);border-radius:16px;background:var(--bg-card);text-align:center;color:var(--text-muted)}.ux-no-results strong,.ux-login-prompt strong{color:var(--text);font-size:1.05rem}.ux-no-results span,.ux-login-prompt span{font-size:.84rem;margin-bottom:8px}' +
        '.ux-detail-info-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;width:100%;margin-bottom:14px}.ux-detail-info-grid>div{padding:13px;border:1px solid var(--border);border-radius:12px;background:var(--bg-card)}.ux-detail-info-grid strong{display:block;margin-bottom:4px;color:var(--text);font-size:.8rem}.ux-detail-info-grid span{display:block;color:var(--text-muted);font-size:.72rem;line-height:1.55}.ux-detail-actions{display:flex;gap:12px;width:100%}' +
        '.ux-checkout-steps{display:flex;align-items:center;justify-content:center;gap:0;margin:0 0 16px;padding:14px;border:1px solid var(--border);border-radius:14px;background:var(--bg-card)}.ux-checkout-step{display:flex;align-items:center;gap:7px;color:var(--text-muted);font-size:.75rem}.ux-checkout-step.is-active{color:var(--text)}.ux-checkout-step b{display:grid;place-items:center;width:25px;height:25px;border-radius:50%;background:var(--bg-elevated);border:1px solid var(--border-light);font-size:.72rem}.ux-checkout-step.is-active b{background:var(--primary);border-color:var(--primary);color:#fff}.ux-checkout-line{width:48px;height:1px;margin:0 10px;background:var(--border-light)}' +
        '.ux-orders-page{max-width:920px;margin:0 auto}.ux-orders-intro{margin-bottom:20px}.ux-orders-intro p{color:var(--text-muted);font-size:.9rem}.ux-orders-list{display:grid;gap:12px}.ux-order-card{padding:17px;border:1px solid var(--border);border-radius:16px;background:linear-gradient(145deg,var(--bg-card),var(--bg-elevated));box-shadow:var(--shadow-sm)}.ux-order-card-head,.ux-order-meta{display:flex;align-items:center;justify-content:space-between;gap:12px}.ux-order-card-head strong{font-size:.85rem;color:var(--text)}.ux-order-card p{margin:12px 0;color:var(--text-muted);font-size:.85rem}.ux-order-meta{padding-top:11px;border-top:1px solid var(--border);color:var(--text-muted);font-size:.75rem}.ux-order-meta strong{color:var(--primary);font-size:.95rem}.ux-status{padding:4px 9px;border-radius:999px;font-size:.7rem;font-weight:800}.ux-status.is-pending{background:#3f2d08;color:#fbbf24}.ux-status.is-success{background:rgba(16,185,129,.13);color:#34d399}.ux-status.is-danger{background:rgba(225,29,72,.14);color:#fb7185}.ux-order-timeline{display:flex;gap:18px;margin-top:12px;color:var(--text-muted);font-size:.72rem}.ux-order-timeline span{position:relative}.ux-order-timeline span+span:before{content:\'\';position:absolute;right:100%;top:50%;width:15px;height:1px;margin-right:3px;background:var(--border-light)}.ux-order-timeline .done{color:#34d399}' +
        '.ux-account-nav{color:#c4b5fd!important}.ux-faq-note{max-width:680px;margin:18px auto 0;padding:14px 16px;border:1px solid var(--border);border-radius:14px;background:var(--primary-soft);color:#c4b5fd;text-align:center;font-size:.8rem}' +
        '@media(max-width:760px){.ux-trust-strip{grid-template-columns:repeat(2,1fr);padding:0 .8rem;margin-top:-20px;gap:8px}.ux-trust-card{padding:12px 8px}.ux-trust-card strong{font-size:.78rem}.ux-trust-card span{font-size:.65rem}.ux-how-section{padding:2.1rem .8rem .5rem}.ux-how-grid{grid-template-columns:1fr;gap:9px}.ux-how-card{padding:15px}.ux-category-tools{align-items:stretch;flex-direction:column;margin-bottom:1rem}.ux-category-tools input,.ux-category-tools select{width:100%}.ux-detail-info-grid{grid-template-columns:repeat(2,1fr);gap:7px}.ux-detail-actions{position:sticky;bottom:8px;z-index:10;padding:8px;border:1px solid var(--border);border-radius:14px;background:rgba(20,19,26,.94);backdrop-filter:blur(10px)}.ux-detail-actions .btn{min-height:46px;padding:10px 8px!important;font-size:.82rem!important}.ux-checkout-steps{padding:11px 6px}.ux-checkout-step{font-size:.65rem}.ux-checkout-line{width:18px;margin:0 5px}.ux-order-card{padding:14px}.ux-order-card-head strong{font-size:.75rem}.ux-order-timeline{gap:10px;font-size:.65rem}}' +
        '@media(max-width:390px){.ux-trust-card span{display:none}.ux-detail-info-grid>div{padding:10px}.ux-detail-info-grid span{font-size:.65rem}}';
      document.head.appendChild(style);
    }

    var navLinks = document.getElementById('navLinks');
    if (navLinks && !document.getElementById('ordersNavLink')) {
      var ordersLink = document.createElement('a');
      ordersLink.id = 'ordersNavLink';
      ordersLink.className = 'ux-account-nav';
      ordersLink.href = '#orders';
      ordersLink.setAttribute('onclick', "showPage('orders')");
      ordersLink.textContent = 'طلباتي';
      var cartLink = navLinks.querySelector('.cart-link');
      if (cartLink && cartLink.nextSibling) navLinks.insertBefore(ordersLink, cartLink.nextSibling);
      else navLinks.appendChild(ordersLink);
    }

    var home = document.getElementById('page-home');
    var hero = home ? home.querySelector('.hero') : null;
    if (hero && !document.getElementById('uxTrustStrip')) {
      hero.insertAdjacentHTML('afterend',
        '<div class="ux-trust-strip" id="uxTrustStrip">' +
        '<div class="ux-trust-card"><div class="ux-trust-icon">✓</div><strong>خدمات واضحة</strong><span>السعر والتفاصيل قبل الطلب</span></div>' +
        '<div class="ux-trust-card"><div class="ux-trust-icon">⚡</div><strong>تنفيذ سريع</strong><span>متابعة مباشرة للطلب</span></div>' +
        '<div class="ux-trust-card"><div class="ux-trust-icon">◈</div><strong>دعم مباشر</strong><span>نحن معك عند الحاجة</span></div>' +
        '<div class="ux-trust-card"><div class="ux-trust-icon">▣</div><strong>تجربة أسهل</strong><span>اطلب وتابع من حسابك</span></div>' +
        '</div>' +
        '<section class="ux-how-section" id="uxHowTo">' +
        '<div class="ux-how-head"><h2>كيف تطلب خدمتك؟</h2><p>ثلاث خطوات بسيطة من اختيار الخدمة حتى متابعة التنفيذ</p></div>' +
        '<div class="ux-how-grid">' +
        '<div class="ux-how-card"><div class="ux-how-number">1</div><h3>اختر الخدمة</h3><p>تصفح الأقسام وافتح تفاصيل الخدمة التي تناسبك.</p></div>' +
        '<div class="ux-how-card"><div class="ux-how-number">2</div><h3>أرسل البيانات</h3><p>أدخل بيانات التواصل والرابط أو المعلومات المطلوبة.</p></div>' +
        '<div class="ux-how-card"><div class="ux-how-number">3</div><h3>تابع طلبك</h3><p>ستجد حالة الطلب وتفاصيله داخل صفحة طلباتك.</p></div>' +
        '</div><div class="ux-faq-note">لديك سؤال قبل الطلب؟ تواصل مع الإدارة من صفحة معلومات صاحب الموقع.</div></section>');
    }

    var categorySection = document.querySelector('#page-category .section');
    var categoryTitle = document.getElementById('categoryTitle');
    if (categorySection && categoryTitle && !document.getElementById('uxCategoryTools')) {
      categoryTitle.insertAdjacentHTML('beforebegin',
        '<div class="ux-category-tools" id="uxCategoryTools">' +
        '<input id="categorySearch" type="search" placeholder="ابحث عن خدمة..." aria-label="البحث عن خدمة">' +
        '<select id="categorySort" aria-label="ترتيب المنتجات"><option value="popular">الأكثر مبيعاً</option><option value="price-low">السعر: من الأقل للأعلى</option><option value="price-high">السعر: من الأعلى للأقل</option></select>' +
        '</div>');
      var search = document.getElementById('categorySearch');
      var sort = document.getElementById('categorySort');
      if (search) search.addEventListener('input', function() {
        categoryFilters.query = search.value.trim().toLowerCase();
        var hash = location.hash || '';
        if (hash.indexOf('category/') === 0) renderCategoryProducts(decodeURIComponent(hash.split('/')[1] || ''));
      });
      if (sort) sort.addEventListener('change', function() {
        categoryFilters.sort = sort.value;
        var hash = location.hash || '';
        if (hash.indexOf('category/') === 0) renderCategoryProducts(decodeURIComponent(hash.split('/')[1] || ''));
      });
    }

    var cartContent = document.getElementById('cartContent');
    if (cartContent && !document.getElementById('uxCheckoutSteps')) {
      cartContent.insertAdjacentHTML('afterbegin',
        '<div class="ux-checkout-steps" id="uxCheckoutSteps">' +
        '<div class="ux-checkout-step is-active"><b>1</b><span>السلة</span></div><i class="ux-checkout-line"></i>' +
        '<div class="ux-checkout-step"><b>2</b><span>البيانات</span></div><i class="ux-checkout-line"></i>' +
        '<div class="ux-checkout-step"><b>3</b><span>التأكيد</span></div></div>');
    }

    var main = document.getElementById('mainContent');
    if (main && !document.getElementById('page-orders')) {
      var ordersPage = document.createElement('section');
      ordersPage.id = 'page-orders';
      ordersPage.className = 'page';
      ordersPage.innerHTML =
        '<div class="section ux-orders-page">' +
        '<button class="btn btn-secondary back-btn" onclick="showPage(\'home\')">← العودة للرئيسية</button>' +
        '<div class="ux-orders-intro"><h2 class="section-title">طلباتي</h2><p>تابع حالة طلباتك وتفاصيل الخدمات التي اشتريتها.</p></div>' +
        '<div class="ux-orders-list" id="userOrdersContent"></div></div>';
      main.appendChild(ordersPage);
    }
  }

  // ========== LOADER ==========
  function startLoader() {
    try {
      var loader = document.getElementById('siteLoader');
      if (!loader) return;
      setTimeout(function() { if (loader) loader.classList.add('hidden'); }, 2500);
      setTimeout(function() {
        if (loader && !loader.classList.contains('hidden')) loader.classList.add('hidden');
      }, 5000);
    } catch(e) {
      var fallbackLoader = document.getElementById('siteLoader');
      if (fallbackLoader) fallbackLoader.classList.add('hidden');
    }
  }

  // ========== HASH ROUTING ==========
  function handleHash() {
    var hash = location.hash.slice(1) || 'home';
    console.log('📍 Hash changed:', hash);
    if (hash.indexOf('category/') === 0) {
      showPage('category', decodeURIComponent(hash.split('/')[1] || ''));
    } else if (hash.indexOf('product/') === 0) {
      showPage('product-detail', decodeURIComponent(hash.split('/')[1] || ''));
    } else if (hash === 'admin') {
      showPage('admin');
    } else {
      showPage(hash);
    }
  }

  // ========== MOBILE MENU ==========
  document.addEventListener('DOMContentLoaded', function() {
    var toggle = document.getElementById('menuToggle');
    if (toggle) {
      toggle.addEventListener('click', function() {
        var links = document.getElementById('navLinks');
        if (links) links.classList.toggle('open');
      });
    }
    console.log('✅ DOM fully loaded');
  });

  // ========== BOOT ==========
  console.log('🚀 Booting IDLEB STORE...');
  enhanceStoreExperience();
  initData();
  loadState();
  handleHash();
  window.addEventListener('hashchange', handleHash);
  renderAbout();
  startLoader();

  console.log('✅ IDLEB STORE ready!');
  console.log('🔍 Available functions:');
  console.log('  - openProductDetail:', typeof window.openProductDetail);
  console.log('  - addToCart:', typeof window.addToCart);
  console.log('  - openQuickOrder:', typeof window.openQuickOrder);
  console.log('  - showPage:', typeof window.showPage);
  console.log('  - verifyOTP:', typeof window.verifyOTP);
  console.log('  - resendVerification:', typeof window.resendVerification);
})();