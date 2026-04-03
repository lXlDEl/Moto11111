const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
console.log("SERVER UPDATED");
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ================== PRODUCTS (IN MEMORY) ==================
let products = [
  {
    id: 1,
    name: "Мінськ 125",
    price: 1200,
    description: "Надійний мотоцикл для початківців.",
    image: "image1.jpg"
  },
  {
    id: 2,
    name: "Geon Scrambler 300",
    price: 3500,
    description: "Стильний скремблер для міста.",
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc"
  },
  {
    id: 3,
    name: "Kawasaki Ninja ZX-6R",
    price: 7800,
    description: "Спортбайк високої продуктивності.",
    image: "https://images.unsplash.com/photo-1609630875171-b1321377ee65"
  }
];

// ================== ROUTES ==================

// Get all products
app.get("/api/products", (req, res) => {
  res.json(products);
});

// Add product (без авторизації)
app.post("/api/products", (req, res) => {
  const { name, price, image, description } = req.body;

  if (!name || !price || !description) {
    return res.status(400).json({ error: "Name, price, description required" });
  }

  const newProduct = {
    id: products.length ? products[products.length - 1].id + 1 : 1,
    name,
    price: Number(price),
    image: image || "https://via.placeholder.com/400x300",
    description
  };

  products.push(newProduct);

  res.json({
    message: "Product added",
    product: newProduct
  });
});

// Delete product
app.delete("/api/products/:id", (req, res) => {
  const id = Number(req.params.id);

  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  products.splice(index, 1);

  res.json({ message: "Product deleted" });
});

// Test route
app.get("/api/message", (req, res) => {
  res.json({
    text: "Привіт з сервера 👋",
    time: new Date()
  });
});

// ================== START SERVER ==================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Products: ${products.length}`);
});