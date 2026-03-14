import React, { useState, useEffect } from 'react';
import api from '../api';
import { useKitchen } from '../KitchenContext';

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { selectedKitchen: kitchen } = useKitchen();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/api/reports/history?kitchen=${encodeURIComponent(kitchen)}`);
        setHistory(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [kitchen]);

  return (
    <div>
      <div className="dashboard-header">
        <h1>Monthly Archives</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Historical performance for <strong>{kitchen}</strong></p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
        {loading ? (
             <p>Loading archives...</p>
        ) : history.length === 0 ? (
          <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
            <h3>No archives found</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Use the "Monthly Reset" feature on the dashboard to archive data.</p>
          </div>
        ) : (
          history.map((record) => (
            <div key={record._id} className="card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.4rem' }}>{record.month}</h3>
                <span style={{ fontSize: '0.7rem', padding: '4px 8px', background: 'var(--background)', borderRadius: '12px' }}>ARCHIVED</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>TOTAL SALES</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--success)' }}>₹{record.totalSales.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>TOTAL EXPENSES</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--danger)' }}>₹{record.totalExpenses.toLocaleString('en-IN')}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>NET PROFIT:</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: record.netProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                  ₹{record.netProfit.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default HistoryPage;
