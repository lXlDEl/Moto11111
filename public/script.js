let products = [
  {
    id: 1,
    name: 'Мінськ 125',
    price: 12000,
    image: 'image1.jpg',
    description: 'Швидкий спортивний мотоцикл для треку.'
  },
  {
    id: 2,
    name: 'Geon Scrambler 300',
    price: 11000,
    image: 'https://championplus.com.ua/content/images/31/536x402l50nn0/mototsykl-geon-scrambler-300-93631545241037.jpg',
    description: 'Ідеальний для міської їзди та перегонів.'
  },
  {
    id: 3,
    name: 'Kawasaki Ninja ZX-6R',
    price: 13000,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTd8JEwezUAgQn3-xMzDGYeCsX0FQXtPg2Awg&s',
    description: 'Потужний мотоцикл з відмінною динамікою.'
  },
  {
    id: 4,
    name: 'Suzuki GSX-R750',
    price: 12500,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoXajD_lHaZZxKeh67X088nWG4tth1MZ1rIA&s',
    description: 'Класичний спортивний байк.'
  }
];

let cart = [];

function renderProducts() {
  const productsContainer = document.getElementById('products');
  productsContainer.innerHTML = '';

  products.forEach(product => {
    const productDiv = document.createElement('div');
    productDiv.className = 'product';
    productDiv.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <p>Ціна: $${product.price}</p>
      <div class="product-actions">
        <button onclick="addToCart(${product.id})">Додати в кошик</button>
        <button class="delete-btn" onclick="deleteProduct(${product.id})">Видалити товар</button>
      </div>
    `;
    productsContainer.appendChild(productDiv);
  });
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  updateCartCount();
  renderCart();
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

function deleteProduct(productId) {
  if (confirm('Ви впевнені, що хочете видалити цей товар?')) {
    products = products.filter(product => product.id !== productId);
    renderProducts();
    // Перевіряємо також кошик, якщо там був цей товар
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    renderCart();
  }
}

document.getElementById('checkout-btn').addEventListener('click', () => {
  if (cart.length === 0) {
    alert('Кошик порожній. Додайте товари перед оформленням замовлення.');
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  alert(`Замовлення оформлено! Загальна сума: $${total}`);
  cart = [];
  updateCartCount();
  renderCart();
});

document.getElementById('add-product-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('product-name').value;
  const price = parseFloat(document.getElementById('product-price').value);
  const description = document.getElementById('product-description').value;
  const imageFile = document.getElementById('product-image').files[0];

  if (!name || !price || !description || !imageFile) {
    alert('Будь ласка, заповніть всі поля.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(event) {
    const imageUrl = event.target.result;
    const newProduct = {
      id: products.length + 1,
      name,
      price,
      image: imageUrl,
      description
    };

    products.push(newProduct);
    renderProducts();

    // Очистити форму
    document.getElementById('add-product-form').reset();
  };
  reader.readAsDataURL(imageFile);
});

// Ініціалізація
renderProducts();
renderCart();