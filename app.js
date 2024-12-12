// app.js
const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const predictRoutes = require("./routes/predict");
const historyRoutes = require("./routes/history");
const profileRoutes = require("./routes/profile");
const path = require("path");
const fs = require("fs");
const { marked } = require("marked");

const app = express();

app.use(bodyParser.json());

// Endpoint untuk API Documentation - pindahkan ke atas
app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "README.md");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .send("Internal Server Error. File README.md tidak ditemukan.");
    }
    const htmlContent = marked(data);
    res.send(`
      <html>
        <head>
          <title>API Documentation</title>
        </head>
        <body>
          <h1>API Documentation</h1>
          ${htmlContent}
        </body>
      </html>
    `);
  });
});

app.use("/auth", authRoutes);
app.use("/predict", predictRoutes);
app.use("/history", historyRoutes);
app.use("/profile", profileRoutes);

const PORT = process.env.PORT || 8080;
const server = app
  .listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  })
  .on("error", (err) => {
    console.error("Server startup error:", err);
  });

// Tambahkan timeout untuk debugging
server.setTimeout(30000); // 30 detik timeout
