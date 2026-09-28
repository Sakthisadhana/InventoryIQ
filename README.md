# InventoryIQ — Inventory Management Dashboard

React.js + Node/Express + PostgreSQL dashboard for tracking stock levels, categories, and stock movements, with Chart.js visualizations and low-stock alerts.

## Stack
- **Frontend:** React.js, Bootstrap 5, Chart.js, Axios
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL

## Prerequisites
- Node.js 18+ installed
- PostgreSQL installed and running locally (or a free hosted instance like Neon/Supabase/Render)

## 1. Set up the database

```bash
createdb inventoryiq
psql -U postgres -d inventoryiq -f server/db/schema.sql
```

The schema also seeds a few sample products so the dashboard isn't empty on first run.

## 2. Set up the backend

```bash
cd server
npm install
cp .env.example .env
```

Open `.env` and set your real `DATABASE_URL`.

```bash
npm run dev
```

API runs at `http://localhost:5001`. Check it's alive:
```
GET http://localhost:5001/api/health
```

## 3. Set up the frontend

Open a **second terminal**:

```bash
cd client
npm install
npm start
```

App opens at `http://localhost:3000`.

## Using the app
1. Add a product with name, SKU, category, quantity, price, and reorder level.
2. Use the **In / Out** controls to record stock movements — quantities update live.
3. Rows highlighted yellow are at or below their reorder level (low stock).
4. The bar chart and summary cards update automatically as stock changes.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | List all products |
| GET | `/api/products/categories` | List categories |
| GET | `/api/products/low-stock` | Products at/below reorder level |
| GET | `/api/products/summary/by-category` | Quantity totals per category (for the chart) |
| POST | `/api/products` | Create a product |
| PUT | `/api/products/:id` | Update product details |
| POST | `/api/products/:id/stock` | Record a stock in/out movement |
| DELETE | `/api/products/:id` | Delete a product |

## Project Structure
```
inventoryiq/
├── server/
│   ├── db/            # schema.sql (with sample data) + PostgreSQL pool
│   ├── routes/         # products.js
│   └── index.js        # Express entrypoint
└── client/
    └── src/
        ├── components/  # ProductForm, ProductTable, StockChart
        ├── api.js       # Axios instance
        └── App.js
```
