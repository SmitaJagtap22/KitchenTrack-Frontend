import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useKitchen } from '../KitchenContext';

function AddSalesPage() {
  const navigate = useNavigate();
  const { selectedKitchen } = useKitchen();
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('Swiggy');
  const [paymentMethod, setPaymentMethod] = useState('Online');
  const [date, setDate] = useState('');
  const [orderId, setOrderId] = useState('');
  const [kitchen, setKitchen] = useState(selectedKitchen);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ msg: '', type: '' });

  // Sync with global kitchen if it changes while on this page
  React.useEffect(() => {
    setKitchen(selectedKitchen);
  }, [selectedKitchen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (paymentMethod === 'Online' && !orderId) {
      alert("Order/Transaction ID is required for online payments.");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/api/sales/add', { amount: parseFloat(amount), date, kitchen, source, paymentMethod, orderId });
      setStatus({ msg: '✅ Sale recorded successfully!', type: 'success' });
      setAmount(''); setDate(''); setOrderId('');
    } catch (err) {
      setStatus({ msg: '❌ Failed to record sale.', type: 'danger' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="dashboard-header">
        <h1>Record Sale</h1>
        <button className="btn tertiary-btn" onClick={() => navigate('/dashboard')}>← Back</button>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="form-group">
              <label>Sale Amount (₹)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="premium-input" placeholder="0.00" required step="0.01" />
            </div>
            <div className="form-group">
              <label>Order Source</label>
              <select value={source} onChange={(e) => setSource(e.target.value)} className="premium-input">
                <option value="Swiggy">🛵 Swiggy</option>
                <option value="Zomato">🍕 Zomato</option>
                <option value="Takeaway">🛍️ Takeaway</option>
                <option value="Sales from Ads">🚀 Sales from Ads</option>
                <option value="Sales from Offers">🎁 Sales from Offers</option>
              </select>
            </div>
            <div className="form-group">
              <label>Payment Method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="premium-input">
                <option value="Online">💳 Online</option>
                <option value="Cash">💵 Cash</option>
              </select>
            </div>
            <div className="form-group">
              <label>Transaction/Order ID</label>
              <input type="text" value={orderId} onChange={(e) => setOrderId(e.target.value)} className="premium-input" placeholder={paymentMethod === 'Online' ? 'Required for Online' : 'Optional'} required={paymentMethod === 'Online'} />
            </div>
            <div className="form-group">
              <label>Date of Sale</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="premium-input" required />
            </div>
            <div className="form-group">
              <label>Kitchen Branch</label>
              <select value={kitchen} onChange={(e) => setKitchen(e.target.value)} className="premium-input">
                <option value="Kitchen 1">🌙 NightWokDelight</option>
                <option value="Kitchen 2">🍛 Biryani Culture</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn primary-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }} disabled={isSubmitting}>
            {isSubmitting ? 'Recording...' : 'Add Sale Record'}
          </button>
        </form>
        {status.msg && <p style={{ marginTop: '1.5rem', textAlign: 'center', color: status.type === 'success' ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>{status.msg}</p>}
      </div>
    </div>
  );
}

export default AddSalesPage;
