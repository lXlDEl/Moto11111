let allProducts = [];
let products = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

let pexelsImages = [];

// ================== PEXELS (optional) ==================
const PEXELS_API_KEY = "YOUR_PEXELS_API_KEY";
const PEXELS_SEARCH_URL = "https://api.pexels.com/v1/search";

async function fetchMotorcyclePhotos() {
  try {
    if (PEXELS_API_KEY === "YOUR_PEXELS_API_KEY") return;

    const res = await fetch(`${PEXELS_SEARCH_URL}?query=motorcycle&per_page=30`, {
      headers: { Authorization: PEXELS_API_KEY }
    });

    const data = await res.json();
    pexelsImages = data.photos.map(p => p.src.medium);
  } catch (e) {
    console.log("Pexels error:", e);
  }
}

function getMotorcyclePhoto() {
  if (pexelsImages.length > 0) {
    return pexelsImages[Math.floor(Math.random() * pexelsImages.length)];
  }
  return "https://via.placeholder.com/420x280?text=Motorcycle";
}

fetchMotorcyclePhotos();

// ================== PRODUCTS ==================
async function loadProducts() {
  try {
    const res = await fetch("/api/products");
    allProducts = await res.json();
    filterAndSortProducts();
  } catch (e) {
    console.error("Error loading products:", e);
  }
}

function filterAndSortProducts() {
  let filtered = [...allProducts];

  const search = document.getElementById("search-input")?.value?.toLowerCase();
  if (search) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(search) ||
      p.description.toLowerCase().includes(search)
    );
  }

  const sort = document.getElementById("sort-select")?.value;

  if (sort === "price-asc") filtered.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") filtered.sort((a, b) => b.price - a.price);
  else filtered.sort((a, b) => a.name.localeCompare(b.name));

  products = filtered;
  renderProducts();
}

// ================== RENDER PRODUCTS ==================
function renderProducts() {
  const container = document.getElementById("products");
  container.innerHTML = "";

  if (!products.length) {
    container.innerHTML = "<p>Нема товарів</p>";
    return;
  }

  products.forEach(p => {
    const img = p.image || getMotorcyclePhoto();

    const div = document.createElement("div");
    div.className = "product";

    div.innerHTML = `
      <img src="${img}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <p>$${p.price}</p>
      <button onclick="addToCart(${p.id})">Додати в кошик</button>
    `;

    container.appendChild(div);
  });
}

// ================== CART (LOCAL ONLY) ==================
function addToCart(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(i => i.product_id === productId);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({
      id: Date.now(),
      product_id: productId,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }

  saveCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  renderCart();
}

// ================== CART UI ==================
function updateCartCount() {
  const el = document.getElementById("cart-count");
  if (!el) return;

  el.textContent = cart.reduce((sum, i) => sum + i.quantity, 0);
}

function renderCart() {
  const container = document.getElementById("cart-items");
  container.innerHTML = "";

  if (!cart.length) {
    container.innerHTML = "<p>Кошик порожній</p>";
    return;
  }

  cart.forEach(i => {
    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
      <h4>${i.name}</h4>
      <p>Кількість: ${i.quantity}</p>
      <p>Ціна: $${i.price * i.quantity}</p>
      <button onclick="removeFromCart(${i.id})">Видалити</button>
    `;

    container.appendChild(div);
  });
}

// ================== CHECKOUT ==================
function checkout() {
  if (!cart.length) {
    alert("Кошик порожній");
    return;
  }

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  alert(`Замовлення оформлено! Сума: $${total}`);

  cart = [];
  saveCart();
}

// ================== INIT ==================
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  renderCart();
  updateCartCount();

  const search = document.getElementById("search-input");
  const sort = document.getElementById("sort-select");

  if (search) search.addEventListener("input", filterAndSortProducts);
  if (sort) sort.addEventListener("change", filterAndSortProducts);

  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) checkoutBtn.addEventListener("click", checkout);
});