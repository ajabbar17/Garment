// Shared state
const state = {
  cart: [],
  products: []
};

// Utils
const formatPrice = (price) => `$${Number(price).toFixed(2)}`;

// API
const api = {
  getProducts: async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    state.products = data;
    return data;
  },
  getProduct: async (id) => {
    const res = await fetch(`/api/products/${id}`);
    if (!res.ok) return null;
    return res.json();
  },
  getCart: async () => {
    const res = await fetch('/api/cart');
    return res.json();
  },
  addToCart: async (productId, quantity) => {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity })
    });
    return res.json();
  },
  updateCartItem: async (productId, quantity) => {
    const res = await fetch(`/api/cart/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity })
    });
    return res.json();
  },
  removeFromCart: async (productId) => {
    const res = await fetch(`/api/cart/${productId}`, {
      method: 'DELETE'
    });
    return res.json();
  },
  createOrder: async (orderData) => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (!res.ok) throw new Error('Order failed');
    return res.json();
  },
  adminLogin: async (creds) => {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(creds)
    });
    if (!res.ok) throw new Error('Failed');
    return res.json();
  },
  checkAdmin: async () => {
    const res = await fetch('/api/admin/check');
    return res.json();
  },
  addProduct: async (data) => {
    await fetch('/api/products', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    });
  },
  deleteProduct: async (id) => {
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
  },
  getOrders: async () => (await fetch('/api/orders')).json(),
  logout: async () => {
     await fetch('/api/admin/logout', { method: 'POST' });
     window.location.reload();
  }
};

// UI Functions
function updateCartCount(count) {
  const el = document.getElementById('cart-count');
  if (el) el.textContent = count;
}

async function initCart() {
  const cart = await api.getCart();
  state.cart = cart;
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);
  updateCartCount(count);
}

function showView(viewId) {
  document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
  const el = document.getElementById(viewId);
  if (el) el.classList.add('active');
  window.scrollTo(0, 0);
}

function renderProductGrid(products, container) {
  container.innerHTML = products.map(p => `
    <div class="product-card" onclick="window.location.href='/product.html?id=${p.id}'">
      <div class="product-image-container">
        <img src="${p.image}" alt="${p.name}" class="product-image" loading="lazy">
      </div>
      <div class="product-info">
        <span class="product-name">${p.name}</span>
        <span class="product-price">${formatPrice(p.price)}</span>
      </div>
    </div>
  `).join('');
}

// Routes
async function initHome() {
  showView('view-home');
  const products = await api.getProducts();
  const featured = products.slice(0, 2);
  const grid = document.getElementById('featured-grid');
  if (grid) renderProductGrid(featured, grid);
}

async function initProducts() {
  showView('view-products');
  const products = await api.getProducts();
  const grid = document.getElementById('products-grid');
  const filter = document.getElementById('category-filter');
  
  const render = (items) => renderProductGrid(items, grid);
  render(products);

  filter.onchange = (e) => {
    const val = e.target.value;
    const filtered = val === 'ALL' ? products : products.filter(p => p.category === val);
    render(filtered);
  };
}

async function initProductDetail() {
  showView('view-product-detail');
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) return;

  const product = await api.getProduct(id);
  if (!product) return;

  const img = document.getElementById('product-image');
  const name = document.getElementById('product-name');
  const price = document.getElementById('product-price');
  const desc = document.getElementById('product-description');
  
  if(img) img.src = product.image;
  if(name) name.textContent = product.name;
  if(price) price.textContent = formatPrice(product.price);
  if(desc) desc.textContent = product.description;

  const addBtn = document.getElementById('add-to-cart');
  const qtyInput = document.getElementById('qty');
  const minusBtn = document.getElementById('qty-minus');
  const plusBtn = document.getElementById('qty-plus');
  
  // Clone to refresh listeners
  const newAddBtn = addBtn.cloneNode(true);
  addBtn.parentNode.replaceChild(newAddBtn, addBtn);
  
  minusBtn.onclick = () => { if (qtyInput.value > 1) qtyInput.value--; };
  plusBtn.onclick = () => { qtyInput.value++; };

  newAddBtn.onclick = async function() {
    this.disabled = true;
    this.textContent = 'ACQUIRED';
    await api.addToCart(product.id, parseInt(qtyInput.value));
    await initCart();
    setTimeout(() => {
      this.disabled = false;
      this.textContent = 'ACQUIRE OBJECT';
    }, 1500);
  };
}

async function initCartPage() {
  showView('view-cart');
  const cart = await api.getCart();
  const products = await api.getProducts();
  const container = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  
  if (cart.length === 0) {
    container.innerHTML = '<p style="font-size:1.5rem; color:#444;">BAG IS EMPTY</p>';
    totalEl.textContent = '$0.00';
    return;
  }

  let total = 0;
  container.innerHTML = cart.map(item => {
    const p = products.find(x => x.id === item.productId);
    if (!p) return '';
    const itemTotal = p.price * item.quantity;
    total += itemTotal;
    
    return `
      <div class="cart-item">
        <img src="${p.image}" class="cart-item-img">
        <div>
          <h3 style="font-size:1.5rem; font-weight:700;">${p.name}</h3>
          <p style="color:#666;">UNITS: ${item.quantity}</p>
          <button onclick="removeItem('${p.id}')" style="background:none; border:none; color:var(--accent); text-transform:uppercase; cursor:pointer; margin-top:10px;">Remove</button>
        </div>
        <div style="font-size:1.5rem;">${formatPrice(itemTotal)}</div>
      </div>
    `;
  }).join('');
  
  totalEl.textContent = formatPrice(total);

  window.removeItem = async (id) => {
    await api.removeFromCart(id);
    initCartPage();
    initCart();
  };
}

async function initCheckout() {
  showView('view-checkout');
  const form = document.getElementById('checkout-form');
  const cart = await api.getCart();
  const products = await api.getProducts();
  const total = cart.reduce((acc, item) => {
    const p = products.find(x => x.id === item.productId);
    return acc + (p ? p.price * item.quantity : 0);
  }, 0);
  
  document.getElementById('order-total-summary').textContent = formatPrice(total);

  form.onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    await api.createOrder({
      customerName: fd.get('name'),
      email: fd.get('email'),
      address: fd.get('address'),
      items: cart,
      total: total
    });
    alert('ACQUISITION COMPLETE');
    window.location.href = '/';
  };
}

async function initAdmin() {
  const { isAdmin } = await api.checkAdmin();
  if (!isAdmin) { showView('view-admin-login'); return; }
  showView('view-admin-dashboard');
  loadDashboard();
}

async function loadDashboard() {
  const products = await api.getProducts();
  const orders = await api.getOrders();

  document.getElementById('admin-products').innerHTML = products.map(p => `
    <tr>
      <td>${p.name}</td>
      <td>${formatPrice(p.price)}</td>
      <td>${p.stock}</td>
      <td><button onclick="deleteProd('${p.id}')" style="background:var(--accent); color:#fff; border:none; padding:5px 10px;">DELETE</button></td>
    </tr>
  `).join('');

  document.getElementById('admin-orders').innerHTML = orders.map(o => `
    <tr>
      <td>${o.id.slice(0,8)}</td>
      <td>${o.customerName}</td>
      <td>${formatPrice(o.total)}</td>
      <td>${new Date(o.createdAt).toLocaleDateString()}</td>
    </tr>
  `).join('');
}

window.deleteProd = async (id) => { if(confirm('ERASE?')) { await api.deleteProduct(id); loadDashboard(); } };

document.getElementById('login-form').onsubmit = async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  try {
    await api.adminLogin(Object.fromEntries(fd));
    initAdmin();
  } catch { alert('INVALID KEY'); }
};

document.getElementById('add-product-form').onsubmit = async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const data = Object.fromEntries(fd);
  data.price = parseFloat(data.price);
  data.stock = 10;
  await api.addProduct(data);
  e.target.reset();
  loadDashboard();
};

document.getElementById('logout-btn').onclick = api.logout;

// Router
function handleRoute() {
  const path = window.location.pathname;
  initCart();
  if (path === '/' || path === '/index.html') initHome();
  else if (path === '/products.html') initProducts();
  else if (path === '/product.html') initProductDetail();
  else if (path === '/cart.html') initCartPage();
  else if (path === '/checkout.html') initCheckout();
  else if (path === '/admin.html') initAdmin();
  else initHome();
}

handleRoute();
window.onpopstate = handleRoute;
