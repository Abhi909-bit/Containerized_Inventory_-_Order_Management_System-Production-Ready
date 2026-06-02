import { useEffect, useState } from 'react';
import { getProducts, getCustomers, getOrders } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, customers: 0, orders: 0, lowStock: [] });

  useEffect(() => {
    Promise.all([getProducts(), getCustomers(), getOrders()]).then(([p, c, o]) => {
      setStats({
        products: p.data.length,
        customers: c.data.length,
        orders: o.data.length,
        lowStock: p.data.filter(pr => pr.quantity < 5),
      });
    });
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="cards">
        <div className="card">📦 Products<br /><b>{stats.products}</b></div>
        <div className="card">👥 Customers<br /><b>{stats.customers}</b></div>
        <div className="card">🛒 Orders<br /><b>{stats.orders}</b></div>
      </div>
      <h3>⚠️ Low Stock (qty &lt; 5)</h3>
      {stats.lowStock.length === 0 ? <p>All good!</p> : (
        <ul>{stats.lowStock.map(p => <li key={p.id}>{p.name} — {p.quantity} left</li>)}</ul>
      )}
    </div>
  );
}