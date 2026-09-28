import React, { useEffect, useState, useCallback } from "react";
import api from "./api";
import ProductForm from "./components/ProductForm";
import ProductTable from "./components/ProductTable";
import StockChart from "./components/StockChart";

export default function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState([]);
  const [lowStockCount, setLowStockCount] = useState(0);

  const loadData = useCallback(async () => {
    try {
      const [prodRes, catRes, summaryRes, lowRes] = await Promise.all([
        api.get("/products"),
        api.get("/products/categories"),
        api.get("/products/summary/by-category"),
        api.get("/products/low-stock")
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
      setSummary(summaryRes.data);
      setLowStockCount(lowRes.data.length);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async (form) => {
    await api.post("/products", form);
    loadData();
  };

  const handleStockMove = async (id, change_type, quantity) => {
    await api.post(`/products/${id}/stock`, { change_type, quantity });
    loadData();
  };

  const handleDelete = async (id) => {
    await api.delete(`/products/${id}`);
    loadData();
  };

  const totalValue = products.reduce((sum, p) => sum + Number(p.unit_price) * p.quantity, 0);

  return (
    <div className="container py-4">
      <h2 className="mb-4">📦 InventoryIQ</h2>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card stat-card shadow-sm p-3 text-center">
            <div className="text-muted small">Total Products</div>
            <div className="fs-3 fw-bold">{products.length}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card stat-card shadow-sm p-3 text-center">
            <div className="text-muted small">Low Stock Items</div>
            <div className="fs-3 fw-bold text-warning">{lowStockCount}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card stat-card shadow-sm p-3 text-center">
            <div className="text-muted small">Total Inventory Value</div>
            <div className="fs-3 fw-bold text-success">₹{totalValue.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {summary.length > 0 && <StockChart summary={summary} />}

      <ProductForm categories={categories} onCreate={handleCreate} />

      <ProductTable products={products} onStockMove={handleStockMove} onDelete={handleDelete} />
    </div>
  );
}
