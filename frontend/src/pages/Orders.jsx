import { useEffect, useState } from 'react';
import { getOrders, createOrder, deleteOrder, getProducts, getCustomers } from '../api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [msg, setMsg] = useState('');

  const load = () => getOrders().then(r => setOrders(r.data));
  useEffect(() => {
    load();
    getProducts().then(r => setProducts(r.data));
    getCustomers().then(r => setCustomers(r.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createOrder({
        customer_id: parseInt(customerId),
        items: items.map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity) }))
      });
      setMsg('✅ Order placed!');
      load();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.detail || 'Error'));
    }
  };

  return (
    <div>
      <h1>Orders</h1>
      {msg && <p className="msg">{msg}</p>}
      <form onSubmit={handleSubmit} className="form">
        <select required value={customerId} onChange={e => setCustomerId(e.target.value)}>
          <option value="">Select Customer</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
        </select>
        {items.map((item, i) => (
          <div key={i} style={{display:'flex', gap:'8px'}}>
            <select required value={item.product_id} onChange={e => { const n=[...items]; n[i].product_id=e.target.value; setItems(n); }}>
              <option value="">Select Product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} (stock: {p.quantity})</option>)}
            </select>
            <input type="number" min="1" value={item.quantity} onChange={e => { const n=[...items]; n[i].quantity=e.target.value; setItems(n); }} />
          </div>
        ))}
        <button type="button" onClick={() => setItems([...items, {product_id:'', quantity:1}])}>+ Add Item</button>
        <button type="submit">Place Order</button>
      </form>
      <table className="table">
        <thead><tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id}>
              <td>#{o.id}</td>
              <td>{customers.find(c => c.id === o.customer_id)?.full_name || o.customer_id}</td>
              <td>₹{o.total_amount}</td>
              <td>{new Date(o.created_at).toLocaleDateString()}</td>
              <td><button onClick={async () => { await deleteOrder(o.id); load(); }}>🗑 Cancel</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}