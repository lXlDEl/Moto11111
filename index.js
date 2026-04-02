const express = require("express");
const app = express();

app.use(express.static("public"));

// API endpoint
app.get("/api/message", (req, res) => {
  res.json({
    text: "Привіт з сервера 👋",
    time: new Date()
  });
});

app.listen(3000, () => {
  console.log("http://localhost:3000");
});