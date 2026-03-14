import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { useKitchen } from '../KitchenContext';

function TransactionsPage() {
  const [activeTab, setActiveTab] = useState('Sales');
  const { selectedKitchen: kitchen, setSelectedKitchen: setKitchen } = useKitchen(); 
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Manual entry states
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualType, setManualType] = useState('Cash');
  const [manualAmount, setManualAmount] = useState('');
  const [manualOrderId, setManualOrderId] = useState('');
  const [manualSubmitting, setManualSubmitting] = useState(false);

  // Import states
  const [file, setFile] = useState(null);
  const [importPlatform, setImportPlatform] = useState('swiggy');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'Sales' ? '/api/sales' : '/api/expenses';
      const res = await api.get(`${endpoint}?kitchen=${encodeURIComponent(kitchen)}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, kitchen]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setManualSubmitting(true);
    try {
      await api.post('/api/sales/add', {
        amount: parseFloat(manualAmount),
        date: new Date().toISOString(),
        kitchen,
        source: manualType === 'Cash' ? 'Takeaway' : 'Direct Online',
        paymentMethod: manualType,
        orderId: manualOrderId || undefined
      });
      setManualAmount('');
      setManualOrderId('');
      setShowManualForm(false);
      fetchData();
    } catch (err) {
      alert("Error adding entry: " + (err.response?.data?.message || err.message));
    } finally {
      setManualSubmitting(false);
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select an Excel file first.");
      return;
    }
    setImporting(true);
    setImportResult('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('kitchen', kitchen);
    formData.append('platform', importPlatform);

    try {
      const res = await api.post('/api/sales/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImportResult(`✅ ${res.data.summary}`);
      fetchData();
      setActiveTab('Sales'); // Ensure we are on Sales tab to see the result
    } catch (err) {
      setImportResult(`❌ Import failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <h1>Transactions Log</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select value={kitchen} onChange={(e) => setKitchen(e.target.value)} className="premium-input" style={{ width: 'auto' }}>
            <option value="Kitchen 1">🌙 NightWokDelight</option>
            <option value="Kitchen 2">🍛 Biryani Culture</option>
          </select>
        </div>
      </div>

      {/* Entry Options Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <button 
          className="btn tertiary-btn" 
          style={{ justifyContent: 'center', background: 'white', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '15px', flexDirection: 'column', gap: '10px' }}
          onClick={() => { setManualType('Cash'); setShowManualForm(true); setManualOrderId(''); }}
        >
          <span style={{ fontSize: '1.8rem' }}>💵</span>
          <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Cash Entry</span>
        </button>
        <button 
          className="btn tertiary-btn" 
          style={{ justifyContent: 'center', background: 'white', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '15px', flexDirection: 'column', gap: '10px' }}
          onClick={() => { setManualType('Online'); setShowManualForm(true); }}
        >
          <span style={{ fontSize: '1.8rem' }}>💳</span>
          <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Online Payment Entry</span>
        </button>
        <button 
          className="btn tertiary-btn" 
          style={{ justifyContent: 'center', background: 'white', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '15px', flexDirection: 'column', gap: '10px' }}
          onClick={() => { setImportPlatform('swiggy'); document.getElementById('excel-section').scrollIntoView({ behavior: 'smooth' }); }}
        >
          <span style={{ fontSize: '1.8rem' }}>🛵</span>
          <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Swiggy</span>
        </button>
        <button 
          className="btn tertiary-btn" 
          style={{ justifyContent: 'center', background: 'white', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '15px', flexDirection: 'column', gap: '10px' }}
          onClick={() => { setImportPlatform('zomato'); document.getElementById('excel-section').scrollIntoView({ behavior: 'smooth' }); }}
        >
          <span style={{ fontSize: '1.8rem' }}>🍕</span>
          <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Zomato</span>
        </button>
      </div>

      {/* Manual Entry Form */}
      {showManualForm && (
        <div className="card" style={{ marginBottom: '2.5rem', border: '2px solid var(--accent)', animation: 'slideDown 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>New {manualType} Transaction</h3>
            <button className="btn tertiary-btn" onClick={() => setShowManualForm(false)}>✕ Close</button>
          </div>
          <form onSubmit={handleManualSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', alignItems: 'end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Amount (₹)</label>
              <input type="number" value={manualAmount} onChange={(e) => setManualAmount(e.target.value)} className="premium-input" placeholder="Enter amount" required />
            </div>
            {manualType === 'Online' && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Transaction ID / Order ID</label>
                <input type="text" value={manualOrderId} onChange={(e) => setManualOrderId(e.target.value)} className="premium-input" placeholder="TXN ID" required />
              </div>
            )}
            <button type="submit" className="btn primary-btn" style={{ justifyContent: 'center' }} disabled={manualSubmitting}>
              {manualSubmitting ? 'Recording...' : 'Save Entry'}
            </button>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
            <button className={`btn ${activeTab === 'Sales' ? 'primary-btn' : 'tertiary-btn'}`} onClick={() => setActiveTab('Sales')}>View Sales</button>
            <button className={`btn ${activeTab === 'Expenses' ? 'primary-btn' : 'tertiary-btn'}`} onClick={() => setActiveTab('Expenses')}>View Expenses</button>
          </div>
          
          <div className="table-container card" style={{ padding: 0 }}>
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Date</th>
                  {activeTab === 'Sales' ? <th>Source</th> : <th>Title / Category</th>}
                  <th>Payment Method</th>
                  <th>Amount (₹)</th>
                  {activeTab === 'Sales' && <th>Order ID</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>Fetching records...</td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>No records found for this kitchen.</td></tr>
                ) : (
                  data.map((item, idx) => (
                    <tr key={idx} style={{ animation: idx < 5 ? 'fadeIn 0.5s ease backwards' : 'none' }}>
                      <td>{new Date(item.date).toLocaleDateString()}</td>
                      <td>{activeTab === 'Sales' ? (item.source || 'Takeaway') : `${item.title} (${item.category})`}</td>
                      <td>{item.paymentMethod}</td>
                      <td style={{ fontWeight: 700, color: activeTab === 'Sales' ? 'var(--success)' : 'var(--danger)' }}>
                        ₹{Number(item.amount).toLocaleString('en-IN')}
                      </td>
                      {activeTab === 'Sales' && <td style={{ fontSize: '0.75rem', opacity: 0.7 }}>{item.orderId || '-'}</td>}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div id="excel-section" className="card" style={{ height: 'fit-content' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            📥 Bulk Import (Excel)
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Upload Swiggy or Zomato payout reports to automatically record sales.
          </p>
          
          <form onSubmit={handleImport} id="excel-upload-form">
            <div className="form-group">
              <label>Select Platform</label>
              <select value={importPlatform} onChange={(e) => setImportPlatform(e.target.value)} className="premium-input">
                <option value="swiggy">🛵 Swiggy</option>
                <option value="zomato">🍕 Zomato</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Excel File (.xlsx)</label>
              <input 
                type="file" 
                accept=".xlsx" 
                onChange={(e) => setFile(e.target.files[0])} 
                className="premium-input"
                style={{ padding: '8px' }}
              />
            </div>

            <button type="submit" className="btn primary-btn" style={{ width: '100%', justifyContent: 'center' }} disabled={importing}>
              {importing ? '⏳ Importing...' : 'Import Data'}
            </button>
          </form>

          {importResult && (
            <div style={{ marginTop: '1.5rem', padding: '12px', background: 'var(--background)', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
              {importResult}
            </div>
          )}

          <div style={{ marginTop: '2rem', padding: '1rem', border: '1px dashed var(--border)', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>Tips for Excel Import:</h4>
            <ul style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem' }}>
              <li>Ensure headers like "Order ID", "Date", "Amount" are present.</li>
              <li>Duplicates are automatically skipped based on Order ID.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionsPage;
