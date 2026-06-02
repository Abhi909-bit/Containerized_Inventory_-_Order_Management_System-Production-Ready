import { useEffect, useState } from 'react';
import { getProducts, createProduct, deleteProduct, updateProduct } from '../api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', sku: '', price: '', quantity: '' });
  const [msg, setMsg] = useState('');

  const load = () => getProducts().then(r => setProducts(r.data));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProduct({ ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity) });
      setMsg('✅ Product added!');
      setForm({ name: '', sku: '', price: '', quantity: '' });
      load();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.detail || 'Error'));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    await deleteProduct(id);
    load();
  };

  return (
    <div>
      <h1>Products</h1>
      {msg && <p className="msg">{msg}</p>}
      <form onSubmit={handleSubmit} className="form">
        <input required placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        <input required placeholder="SKU" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} />
        <input required type="number" placeholder="Price" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
        <input required type="number" placeholder="Quantity" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
        <button type="submit">Add Product</button>
      </form>
      <table className="table">
        <thead><tr><th>Name</th><th>SKU</th><th>Price</th><th>Qty</th><th>Actions</th></tr></thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td><td>{p.sku}</td><td>₹{p.price}</td><td>{p.quantity}</td>
              <td><button onClick={() => handleDelete(p.id)}>🗑 Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}