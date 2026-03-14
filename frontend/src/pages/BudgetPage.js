import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { useKitchen } from '../KitchenContext';

function BudgetPage() {
  const { selectedKitchen: kitchen, setSelectedKitchen: setKitchen } = useKitchen();
  const [budgetAmount, setBudgetAmount] = useState('');
  const [currentBudget, setCurrentBudget] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ msg: '', type: '' });

  const fetchBudgetData = useCallback(async () => {
    setLoading(true);
    try {
      const [currRes, histRes] = await Promise.all([
        api.get(`/api/budget/current?kitchen=${encodeURIComponent(kitchen)}`),
        api.get(`/api/budget/history?kitchen=${encodeURIComponent(kitchen)}`)
      ]);
      setCurrentBudget(currRes.data.amount);
      setHistory(histRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [kitchen]);

  useEffect(() => {
    fetchBudgetData();
  }, [fetchBudgetData]);

  const handleSetBudget = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/budget/set', { kitchen, amount: parseFloat(budgetAmount) });
      setStatus({ msg: '✅ Monthly budget updated!', type: 'success' });
      setBudgetAmount('');
      fetchBudgetData();
    } catch (err) {
      setStatus({ msg: '❌ Failed to update budget.', type: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <h1>Monthly Budget</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select value={kitchen} onChange={(e) => setKitchen(e.target.value)} className="premium-input" style={{ width: 'auto' }}>
            <option value="Kitchen 1">🌙 NightWokDelight</option>
            <option value="Kitchen 2">🍛 Biryani Culture</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Set Current Month Budget</h3>
          <div style={{ background: 'var(--background)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>CURRENT ALLOWANCE</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>₹{currentBudget.toLocaleString('en-IN')}</div>
          </div>

          <form onSubmit={handleSetBudget}>
            <div className="form-group">
              <label>Define Budget for this Month (₹)</label>
              <input 
                type="number" 
                value={budgetAmount} 
                onChange={(e) => setBudgetAmount(e.target.value)} 
                className="premium-input" 
                placeholder="Enter amount..."
                required 
              />
            </div>
            <button type="submit" className="btn primary-btn" style={{ width: '100%', justifyContent: 'center' }} disabled={submitting}>
              {submitting ? 'Updating...' : 'Set Budget'}
            </button>
          </form>
          {status.msg && <p style={{ marginTop: '1.5rem', textAlign: 'center', color: status.type === 'success' ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>{status.msg}</p>}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Budget Allocation History</h3>
          <div className="table-container" style={{ padding: 0 }}>
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Budget Amount</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="2" style={{ textAlign: 'center', padding: '1rem' }}>Loading archive...</td></tr>
                ) : history.length === 0 ? (
                  <tr><td colSpan="2" style={{ textAlign: 'center', padding: '1rem' }}>No history found.</td></tr>
                ) : (
                  history.map((h, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{h.monthKey}</td>
                      <td>₹{h.amount.toLocaleString('en-IN')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BudgetPage;
