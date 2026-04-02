const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = "your-secret-key";

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// ================== IN-MEMORY STORE ==================
let products = [
  {
    id: 1,
    name: "Мінськ 125",
    price: 1200,
    description: "Надійний мотоцикл для початківців. Простий, економічний, легкий у обслуговуванні.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Minsk_motorcycle.jpg/800px-Minsk_motorcycle.jpg"
  },
  {
    id: 2,
    name: "Geon Scrambler 300",
    price: 3500,
    description: "Стильний скремблер із сучасним дизайном. Ідеальний для міських поїздок.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop"
  },
  {
    id: 3,
    name: "Kawasaki Ninja ZX-6R",
    price: 7800,
    description: "Спортбайк високої продуктивності. Для досвідчених райдерів з гострими відчуттями.",
    image: "https://images.unsplash.com/photo-1606611013016-969c19d24e38?w=400&h=300&fit=crop"
  },
  {
    id: 4,
    name: "Suzuki GSX-R750",
    price: 8200,
    description: "Легендарний спортбайк із неймовірною потужністю та маневреністю.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop"
  },
  {
    id: 5,
    name: "Honda CBR600RR",
    price: 7500,
    description: "Вишукана спортбайк із відмінною керованістю та надійністю Honda.",
    image: "https://images.unsplash.com/photo-1606611013016-969c19d24e38?w=400&h=300&fit=crop"
  },
  {
    id: 6,
    name: "Yamaha YZF-R6",
    price: 7900,
    description: "Молодіжний спортбайк для любителів середнього класу. Доступна потужність і стиль.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop"
  }
];

let users = [
  {
    id: 1,
    username: "admin",
    email: "admin@example.com",
    password: "$2a$10$YYzfFKkDPW0G0Z8H0v3V.ejWzHq5Z0R5K8zJ7R0xJ0xJ0xJ0xJ0xJ",
    is_admin: true
  }
];

let cart = {};
let orders = [];
let nextOrderId = 1;


// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Auth routes
app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields required" });
  }

  try {
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: users.length + 1,
      username,
      email,
      password: hashedPassword,
      is_admin: false
    };
    users.push(newUser);

    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = users.find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, is_admin: user.is_admin },
      SECRET_KEY
    );
    res.json({
      token,
      user: { id: user.id, username: user.username, is_admin: user.is_admin }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Products routes
app.get("/api/products", (req, res) => {
  res.json(products);
});

app.post("/api/products", authenticateToken, async (req, res) => {
  const { name, price, image, description } = req.body;
  if (!name || !price || !description) {
    return res.status(400).json({ error: "Name, price, and description required" });
  }

  const newProduct = {
    id: Math.max(...products.map(p => p.id), 0) + 1,
    name,
    price: parseFloat(price),
    image: image || "https://via.placeholder.com/400x300?text=No+Image",
    description
  };
  products.push(newProduct);
  res.json({ message: "Product added", product: newProduct });
});

app.delete("/api/products/:id", authenticateToken, (req, res) => {
  const productId = parseInt(req.params.id);
  const productIndex = products.findIndex(p => p.id === productId);

  if (productIndex === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  products.splice(productIndex, 1);
  res.json({ message: "Product deleted" });
});

// Cart routes
app.get("/api/cart", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const userCart = cart[userId] || [];
  
  const cartWithDetails = userCart.map(item => {
    const product = products.find(p => p.id === item.product_id);
    return {
      id: item.id,
      product_id: item.product_id,
      quantity: item.quantity,
      name: product ? product.name : "Unknown",
      price: product ? product.price : 0,
      image: product ? product.image : ""
    };
  });

  res.json(cartWithDetails);
});

app.post("/api/cart", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  if (!cart[userId]) {
    cart[userId] = [];
  }

  const existingItem = cart[userId].find(item => item.product_id === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart[userId].push({
      id: Date.now(),
      product_id: productId,
      quantity
    });
  }

  res.json({ message: "Added to cart" });
});

app.delete("/api/cart/:id", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const cartItemId = parseInt(req.params.id);

  if (!cart[userId]) {
    return res.status(404).json({ error: "Cart not found" });
  }

  const itemIndex = cart[userId].findIndex(item => item.id === cartItemId);
  if (itemIndex === -1) {
    return res.status(404).json({ error: "Item not found" });
  }

  cart[userId].splice(itemIndex, 1);
  res.json({ message: "Removed from cart" });
});

// Checkout
app.post("/api/checkout", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const userCart = cart[userId] || [];

  if (userCart.length === 0) {
    return res.status(400).json({ error: "Cart is empty" });
  }

  let total = 0;
  const orderItems = [];

  for (const item of userCart) {
    const product = products.find(p => p.id === item.product_id);
    if (product) {
      total += item.quantity * product.price;
      orderItems.push({
        product_id: item.product_id,
        name: product.name,
        quantity: item.quantity,
        price: product.price
      });
    }
  }

  const order = {
    id: nextOrderId++,
    user_id: userId,
    total,
    items: orderItems,
    status: "pending",
    created_at: new Date()
  };

  orders.push(order);
  cart[userId] = [];

  res.json({ message: "Order placed", orderId: order.id, total });
});

// Orders
app.get("/api/orders", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const userOrders = orders.filter(o => o.user_id === userId);

  const formattedOrders = [];
  for (const order of userOrders) {
    for (const item of order.items) {
      formattedOrders.push({
        id: order.id,
        total: order.total,
        status: order.status,
        created_at: order.created_at,
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      });
    }
  }

  res.json(formattedOrders);
});

// API endpoint
app.get("/api/message", (req, res) => {
  res.json({
    text: "Привіт з сервера 👋",
    time: new Date()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Каталог доступний з ${products.length} мотоциклів`);
});

process.on('SIGINT', () => {
  console.log('Server stopped.');
  process.exit(0);
});
