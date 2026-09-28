require("dotenv").config();
const express = require("express");
const cors = require("cors");

const productRoutes = require("./routes/products");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "InventoryIQ API is running" }));

app.use("/api/products", productRoutes);

app.use((req, res) => res.status(404).json({ error: "Route not found" }));

app.listen(PORT, () => {
  console.log(`InventoryIQ server running on http://localhost:${PORT}`);
});
