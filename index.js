const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

// Static files (HTML, CSS, JS)
app.use(express.static(__dirname));

// Root → index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log("Server läuft auf Port", PORT);
});
