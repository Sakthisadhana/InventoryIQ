import React, { useState } from "react";

export default function ProductTable({ products, onStockMove, onDelete }) {
  const [moveQty, setMoveQty] = useState({});

  const handleQtyChange = (id, value) => setMoveQty({ ...moveQty, [id]: value });

  const move = (id, type) => {
    const qty = Number(moveQty[id]);
    if (!qty || qty <= 0) return;
    onStockMove(id, type, qty);
    setMoveQty({ ...moveQty, [id]: "" });
  };

  if (products.length === 0) {
    return <p className="text-muted text-center mt-4">No products yet — add one above.</p>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle bg-white shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>Product</th>
            <th>SKU</th>
            <th>Category</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Stock In/Out</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className={p.quantity <= p.reorder_level ? "low-stock-row" : ""}>
              <td>{p.name}</td>
              <td><code>{p.sku}</code></td>
              <td>{p.category_name || "—"}</td>
              <td>
                <strong>{p.quantity}</strong>
                {p.quantity <= p.reorder_level && (
                  <span className="badge bg-warning text-dark ms-2">Low</span>
                )}
              </td>
              <td>₹{Number(p.unit_price).toFixed(2)}</td>
              <td style={{ minWidth: "180px" }}>
                <div className="d-flex gap-1">
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    style={{ width: "70px" }}
                    min="1"
                    value={moveQty[p.id] || ""}
                    onChange={(e) => handleQtyChange(p.id, e.target.value)}
                  />
                  <button className="btn btn-sm btn-success" onClick={() => move(p.id, "in")}>In</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => move(p.id, "out")}>Out</button>
                </div>
              </td>
              <td>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => onDelete(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
