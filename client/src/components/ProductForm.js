import React, { useState } from "react";

export default function ProductForm({ categories, onCreate }) {
  const [form, setForm] = useState({
    name: "",
    sku: "",
    category_id: "",
    quantity: 0,
    unit_price: 0,
    reorder_level: 10
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.sku.trim()) return;
    onCreate(form);
    setForm({ name: "", sku: "", category_id: "", quantity: 0, unit_price: 0, reorder_level: 10 });
  };

  return (
    <form onSubmit={handleSubmit} className="card p-3 shadow-sm mb-4">
      <h5 className="mb-3">Add a product</h5>
      <div className="row g-2">
        <div className="col-md-3">
          <input className="form-control" name="name" placeholder="Product name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="col-md-2">
          <input className="form-control" name="sku" placeholder="SKU" value={form.sku} onChange={handleChange} required />
        </div>
        <div className="col-md-2">
          <select className="form-select" name="category_id" value={form.category_id} onChange={handleChange}>
            <option value="">Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="col-md-1">
          <input className="form-control" type="number" name="quantity" placeholder="Qty" value={form.quantity} onChange={handleChange} min="0" />
        </div>
        <div className="col-md-2">
          <input className="form-control" type="number" name="unit_price" placeholder="Unit price" value={form.unit_price} onChange={handleChange} min="0" step="0.01" />
        </div>
        <div className="col-md-1">
          <input className="form-control" type="number" name="reorder_level" placeholder="Reorder" value={form.reorder_level} onChange={handleChange} min="0" />
        </div>
        <div className="col-md-1">
          <button className="btn btn-primary w-100">Add</button>
        </div>
      </div>
    </form>
  );
}
