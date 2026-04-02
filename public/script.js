let products = [];
let cart = [];
let currentUser = null;
let token = localStorage.getItem('token');

if (token) {
  // Verify token and set user
  fetch('/api/cart', {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(res => {
    if (res.ok) {
      currentUser = JSON.parse(atob(token.split('.')[1]));
      loadCart();
    } else {
      localStorage.removeItem('token');
      token = null;
    }
  }).catch(() => {
    localStorage.removeItem('token');
    token = null;
  });
}

let allProducts = [];

async function loadProducts() {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) {
      console.error('API error:', response.status);
      return;
    }
    allProducts = await response.json();
    console.log('Loaded products:', allProducts.length);
    filterAndSortProducts();
  } catch (error) {
    console.error('Error loading products:', error);
    alert('Помилка завантаження товарів. Перевірте, чи сервер запущений.');
  }
}

function filterAndSortProducts() {
  let filtered = [...allProducts];

  // Search
  const searchTerm = document.getElementById('search-input').value.toLowerCase();
  if (searchTerm) {
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm)
    );
  }

  // Sort
  const sortBy = document.getElementById('sort-select').value;
  if (sortBy === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  products = filtered;
  renderProducts();
}

async function loadCart() {
  if (!token) return;
  try {
    const response = await fetch('/api/cart', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const cartData = await response.json();
    cart = cartData.map(item => ({
      id: item.id,
      product_id: item.product_id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: item.quantity
    }));
    updateCartCount();
    renderCart();
  } catch (error) {
    console.error('Error loading cart:', error);
  }
}

function renderProducts() {
  const productsContainer = document.getElementById('products');
  productsContainer.innerHTML = '';

  if (!products || products.length === 0) {
    productsContainer.innerHTML = '<p style="text-align: center; color: var(--muted); padding: 2rem;">Товари не знайдені. Спробуйте очистити фільтр.</p>';
    return;
  }

  products.forEach(product => {
    const defaultImage = 'https://via.placeholder.com/420x280?text=No+Image';
    const imageSrc = product.image && product.image.trim() !== '' ? product.image : defaultImage;

    const productDiv = document.createElement('div');
    productDiv.className = 'product';
    productDiv.innerHTML = `
      <img src="${imageSrc}" alt="${product.name}" onclick="showProductModal(${product.id})" onerror="this.onerror=null;this.src='${defaultImage}';">
      <h3 onclick="showProductModal(${product.id})" style="cursor: pointer;">${product.name}</h3>
      <p>${product.description}</p>
      <p>Ціна: $${product.price}</p>
      <div class="product-actions">
        <button onclick="addToCart(${product.id})">Додати в кошик</button>
        ${currentUser && currentUser.is_admin ? `<button class="delete-btn" onclick="deleteProduct(${product.id})">Видалити товар</button>` : ''}
      </div>
    `;
    productsContainer.appendChild(productDiv);
  });
}

function showProductModal(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById('product-modal');
  const modalContent = document.getElementById('modal-content');

  modalContent.innerHTML = `
    <img src="${product.image}" alt="${product.name}" style="width: 100%; border-radius: 8px; margin-bottom: 1rem;">
    <h2>${product.name}</h2>
    <p style="font-size: 1.2rem; color: var(--accent); margin: 1rem 0;">Ціна: $${product.price}</p>
    <p>${product.description}</p>
    <div style="margin-top: 2rem;">
      <button onclick="addToCart(${product.id}); closeModal();" style="padding: 0.75rem 1.5rem; background: var(--accent); border: none; border-radius: 8px; color: white; cursor: pointer;">Додати в кошик</button>
    </div>
  `;

  modal.style.display = 'block';
}

async function loadOrders() {
  if (!token) return;
  try {
    const response = await fetch('/api/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const orders = await response.json();
    renderOrders(orders);
  } catch (error) {
    console.error('Error loading orders:', error);
  }
}

function renderOrders(orders) {
  const orderHistory = document.getElementById('order-history');
  orderHistory.innerHTML = '';

  if (orders.length === 0) {
    orderHistory.innerHTML = '<p>У вас поки що немає замовлень.</p>';
    return;
  }

  orders.forEach(order => {
    const orderDiv = document.createElement('div');
    orderDiv.className = 'order-item';
    orderDiv.innerHTML = `
      <h3>Замовлення #${order.id}</h3>
      <p>Дата: ${new Date(order.created_at).toLocaleDateString()}</p>
      <p>Статус: ${order.status}</p>
      <p>Загальна сума: $${order.total}</p>
      <p>Товар: ${order.name} (Кількість: ${order.quantity})</p>
    `;
    orderHistory.appendChild(orderDiv);
  });
}

// Close modal when clicking outside or on close button
function initializeEventListeners() {
  const closeBtn = document.querySelector('.close-modal');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
  
  window.addEventListener('click', (e) => {
    const modal = document.getElementById('product-modal');
    if (e.target === modal) {
      closeModal();
    }
  });

  // Event listeners for auth
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');
  const logoutBtn = document.getElementById('logout-btn');
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');

  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('reg-username').value;
      const email = document.getElementById('reg-email').value;
      const password = document.getElementById('reg-password').value;
      register(username, email, password);
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      login(email, password);
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }

  // Event listeners for search and sort
  if (searchInput) {
    searchInput.addEventListener('input', filterAndSortProducts);
  }
  if (sortSelect) {
    sortSelect.addEventListener('change', filterAndSortProducts);
  }

  // Navbar links smooth scroll
  document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#catalog' || href === '#home') {
        setTimeout(() => {
          const element = document.querySelector(href);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    });
  });

  // Checkout button
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', async () => {
      if (!token) {
        alert('Будь ласка, увійдіть в систему для оформлення замовлення.');
        return;
      }

      if (cart.length === 0) {
        alert('Кошик порожній. Додайте товари перед оформленням замовлення.');
        return;
      }

      try {
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          alert('Замовлення оформлено!');
          await loadCart();
        } else {
          alert('Помилка оформлення замовлення');
        }
      } catch (error) {
        console.error('Error checking out:', error);
      }
    });
  }

  // Add product form
  const addProductForm = document.getElementById('add-product-form');
  if (addProductForm) {
    addProductForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!token) {
        alert('Будь ласка, увійдіть в систему для додавання товару.');
        return;
      }

      const name = document.getElementById('product-name').value;
      const price = parseFloat(document.getElementById('product-price').value);
      const description = document.getElementById('product-description').value;
      const imageFile = document.getElementById('product-image').files[0];

      if (!name || !price || !description || !imageFile) {
        alert('Будь ласка, заповніть всі поля.');
        return;
      }

      const reader = new FileReader();
      reader.onload = async function(event) {
        const imageUrl = event.target.result;

        try {
          const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, price, image: imageUrl, description })
          });

          if (response.ok) {
            await loadProducts();
            addProductForm.reset();
          } else {
            alert('Помилка додавання товару');
          }
        } catch (error) {
          console.error('Error adding product:', error);
        }
      };
      reader.readAsDataURL(imageFile);
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateUI();
    renderCart();
    initializeEventListeners();
  });
} else {
  loadProducts();
  updateUI();
  renderCart();
  initializeEventListeners();
}

async function addToCart(productId) {
  if (!token) {
    alert('Будь ласка, увійдіть в систему, щоб додати товар в кошик.');
    return;
  }

  try {
    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId, quantity: 1 })
    });

    if (response.ok) {
      await loadCart();
    } else {
      alert('Помилка додавання в кошик');
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
  }
}

function updateCartCount() {
  const cartCount = document.getElementById('cart-count');
  cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
}

function renderCart() {
  const cartItems = document.getElementById('cart-items');
  cartItems.innerHTML = '';

  if (cart.length === 0) {
    cartItems.innerHTML = '<p>Кошик порожній.</p>';
    return;
  }

  cart.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.innerHTML = `
      <div>
        <h4>${item.name}</h4>
        <p>Кількість: ${item.quantity}</p>
        <p>Ціна: $${item.price * item.quantity}</p>
      </div>
      <button onclick="removeFromCart(${item.id})">Видалити</button>
    `;
    cartItems.appendChild(itemDiv);
  });
}

async function removeFromCart(cartId) {
  try {
    const response = await fetch(`/api/cart/${cartId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      await loadCart();
    }
  } catch (error) {
    console.error('Error removing from cart:', error);
  }
}

async function deleteProduct(productId) {
  if (!confirm('Ви впевнені, що хочете видалити цей товар?')) return;

  try {
    const response = await fetch(`/api/products/${productId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      await loadProducts();
    } else {
      alert('Помилка видалення товару');
    }
  } catch (error) {
    console.error('Error deleting product:', error);
  }
}

// Auth functions
async function register(username, email, password) {
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    if (response.ok) {
      alert('Реєстрація успішна! Тепер увійдіть в систему.');
    } else {
      const error = await response.json();
      alert(error.error);
    }
  } catch (error) {
    console.error('Error registering:', error);
  }
}

async function login(email, password) {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      const data = await response.json();
      token = data.token;
      currentUser = data.user;
      localStorage.setItem('token', token);
      updateUI();
      await loadProducts();
      await loadCart();
      alert('Вхід успішний!');
    } else {
      const error = await response.json();
      alert(error.error);
    }
  } catch (error) {
    console.error('Error logging in:', error);
  }
}

function logout() {
  token = null;
  currentUser = null;
  localStorage.removeItem('token');
  cart = [];
  updateUI();
  renderProducts();
  renderCart();
}

function updateUI() {
  const authSection = document.getElementById('auth-section');
  const userInfo = document.getElementById('user-info');
  const addProductSection = document.getElementById('add-product');
  const ordersLink = document.getElementById('orders-link');
  const ordersSection = document.getElementById('orders');

  if (currentUser) {
    authSection.style.display = 'none';
    userInfo.style.display = 'block';
    document.getElementById('user-name').textContent = currentUser.username;
    addProductSection.style.display = currentUser.is_admin ? 'block' : 'none';
    ordersLink.style.display = 'block';
    ordersSection.style.display = 'block';
    loadOrders();
  } else {
    authSection.style.display = 'block';
    userInfo.style.display = 'none';
    addProductSection.style.display = 'none';
    ordersLink.style.display = 'none';
    ordersSection.style.display = 'none';
  }
}