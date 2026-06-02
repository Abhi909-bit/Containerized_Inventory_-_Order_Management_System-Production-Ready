import { useEffect, useState } from 'react';
import { getCustomers, createCustomer, deleteCustomer } from '../api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '' });
  const [msg, setMsg] = useState('');

  const load = () => getCustomers().then(r => setCustomers(r.data));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCustomer(form);
      setMsg('✅ Customer added!');
      setForm({ full_name: '', email: '', phone: '' });
      load();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.detail || 'Error'));
    }
  };

  return (
    <div>
      <h1>Customers</h1>
      {msg && <p className="msg">{msg}</p>}
      <form onSubmit={handleSubmit} className="form">
        <input required placeholder="Full Name" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
        <input required type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        <input required placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
        <button type="submit">Add Customer</button>
      </form>
      <table className="table">
        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Actions</th></tr></thead>
        <tbody>
          {customers.map(c => (
            <tr key={c.id}>
              <td>{c.full_name}</td><td>{c.email}</td><td>{c.phone}</td>
              <td><button onClick={async () => { await deleteCustomer(c.id); load(); }}>🗑 Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}