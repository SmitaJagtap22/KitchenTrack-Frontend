import React, { useState, useEffect } from 'react';
import SummaryCard from '../components/SummaryCard';
import api from '../api';
import BusinessMetricCard from '../components/BusinessMetricCard';
import { useKitchen } from '../KitchenContext';

function DashboardPage() {
  const { selectedKitchen, setSelectedKitchen } = useKitchen();
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetLoading, setResetLoading] = useState(false);

  const fetchData = async (kitchen) => {
    setLoading(true);
    try {
      const [expenseRes, salesRes, metricsRes] = await Promise.all([
        api.get(`/api/expenses?kitchen=${encodeURIComponent(kitchen)}`),
        api.get(`/api/sales?kitchen=${encodeURIComponent(kitchen)}`),
        api.get(`/api/reports/metrics?kitchen=${encodeURIComponent(kitchen)}`),
      ]);
      const expensesSum = expenseRes.data.reduce((sum, item) => sum + Number(item.amount), 0);
      const salesSum = salesRes.data.reduce((sum, item) => sum + Number(item.amount), 0);
      setTotalExpenses(expensesSum);
      setTotalSales(salesSum);
      setMetrics(metricsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('selectedKitchen', selectedKitchen);
    fetchData(selectedKitchen);
  }, [selectedKitchen]);

  const handleReset = async () => {
    if (!window.confirm("Archive and reset this month's data?")) return;
    setResetLoading(true);
    try {
      await api.post('/api/reports/archive-reset', { kitchen: selectedKitchen });
      alert("Month data archived successfully!");
      fetchData(selectedKitchen);
    } catch (error) {
      alert("Failed to reset.");
    } finally {
      setResetLoading(false);
    }
  };

  const profit = totalSales - totalExpenses;
  const isProfit = profit >= 0;
  const kitchenName = selectedKitchen === 'Kitchen 1' ? 'NightWokDelight' : 'Biryani Culture';

  return (
    <div className="dashboard-container">
      {/* Header Area */}
      <div className="dashboard-header">
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>Overview</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Performance summary for <strong>{kitchenName}</strong></p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="kitchen-selector-premium">
            <select
              value={selectedKitchen}
              onChange={(e) => setSelectedKitchen(e.target.value)}
              className="premium-input"
              style={{ padding: '0.5rem 1rem', width: 'auto', fontWeight: 600 }}
            >
              <option value="Kitchen 1">🌙 NightWokDelight</option>
              <option value="Kitchen 2">🍛 Biryani Culture</option>
            </select>
          </div>
          <button className="btn primary-btn" onClick={handleReset} disabled={resetLoading}>
            {resetLoading ? '⏳ Resetting...' : '🔄 Monthly Reset'}
          </button>
        </div>
      </div>

      {/* Primary Metrics */}
      {loading ? (
        <div className="summary-grid">
          {[1, 2, 3].map(i => <div key={i} className="card shimmer-card" style={{ height: '160px' }}></div>)}
        </div>
      ) : (
        <div className="summary-grid">
          <SummaryCard title="Monthly Sales" value={`₹${totalSales.toLocaleString('en-IN')}`} type="success" />
          <SummaryCard title="Monthly Expenses" value={`₹${totalExpenses.toLocaleString('en-IN')}`} type="danger" />
          <SummaryCard title={isProfit ? 'Net Profit' : 'Net Loss'} value={`₹${Math.abs(profit).toLocaleString('en-IN')}`} type={isProfit ? 'success' : 'danger'} />
        </div>
      )}

      {/* Business Metrics Section */}
      <div style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          Real-time Analytics <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'var(--accent)', color: 'white', borderRadius: '12px' }}>LIVE</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {!loading && metrics.map((m, i) => (
            <BusinessMetricCard key={i} {...m} />
          ))}
        </div>
      </div>

      {/* Quick Actions Card */}
      <div className="card" style={{ marginTop: '3rem', background: 'var(--secondary)', color: 'white' }}>
        <h3 style={{ color: 'white', marginBottom: '1.5rem' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a href="/sales/add" className="btn primary-btn" style={{ textDecoration: 'none' }}>💰 Add Sale</a>
          <a href="/expenses/add" className="btn secondary-btn" style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.1)' }}>💸 Add Expense</a>
          <a href="/transactions" className="btn secondary-btn" style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.1)' }}>🧾 Transactions</a>
          <a href="/reports" className="btn secondary-btn" style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.1)' }}>📈 Reports</a>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
