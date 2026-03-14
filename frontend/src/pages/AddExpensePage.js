import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useKitchen } from '../KitchenContext';

function AddExpensePage() {
  const navigate = useNavigate();
  const { selectedKitchen } = useKitchen();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [kitchen, setKitchen] = useState(selectedKitchen);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ msg: '', type: '' });

  // Sync with global kitchen if it changes while on this page
  React.useEffect(() => {
    setKitchen(selectedKitchen);
  }, [selectedKitchen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/api/expenses/add', { title, amount: parseFloat(amount), category, date, paymentMethod, kitchen });
      setStatus({ msg: '✅ Expense added successfully!', type: 'success' });
      setTitle(''); setAmount(''); setDate('');
    } catch (err) {
      setStatus({ msg: '❌ Failed to add expense.', type: 'danger' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="dashboard-header">
        <h1>Record Expense</h1>
        <button className="btn tertiary-btn" onClick={() => navigate('/dashboard')}>← Back</button>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="form-group">
              <label>What did you buy?</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="premium-input" placeholder="e.g. Milk & Eggs" required />
            </div>
            <div className="form-group">
              <label>How much? (₹)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="premium-input" placeholder="0.00" required min="1" step="0.01" />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="premium-input">
                <option value="Groceries">🥦 Groceries</option>
                <option value="Labor">👥 Labor/Salary</option>
                <option value="Rent">🏠 Rent & Bills</option>
                <option value="Maintenance">🛠️ Maintenance</option>
                <option value="Advertising">🚀 Advertising</option>
                <option value="Other">📦 Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Purchase Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="premium-input" required />
            </div>
            <div className="form-group">
              <label>Kitchen Location</label>
              <select value={kitchen} onChange={(e) => setKitchen(e.target.value)} className="premium-input">
                <option value="Kitchen 1">🌙 NightWokDelight</option>
                <option value="Kitchen 2">🍛 Biryani Culture</option>
              </select>
            </div>
            <div className="form-group">
              <label>Payment Mode</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="premium-input">
                <option value="Cash">💵 Cash</option>
                <option value="Online">💳 Online / UPI</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn primary-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }} disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Add Expense Entry'}
          </button>
        </form>
        {status.msg && <p style={{ marginTop: '1.5rem', textAlign: 'center', color: status.type === 'success' ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>{status.msg}</p>}
      </div>
    </div>
  );
}

export default AddExpensePage;
