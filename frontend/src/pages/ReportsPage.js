import React, { useState, useEffect, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import api from '../api';
import { useKitchen } from '../KitchenContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function ReportsPage() {
  const { selectedKitchen: kitchen, setSelectedKitchen: setKitchen } = useKitchen();
  const [filter, setFilter] = useState('monthly'); // 'daily', 'weekly', 'monthly'
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [viewMode, setViewMode] = useState('chart'); // 'chart' or 'table'

  // Excel export dates
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/reports/data`, {
        params: { kitchen, filter }
      });
      setReportData(res.data);
    } catch (err) {
      console.error("Error fetching report data:", err);
    } finally {
      setLoading(false);
    }
  }, [kitchen, filter]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const response = await api.get('/api/reports/export', {
        params: { kitchen, from: fromDate, to: toDate },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${kitchen}_Financial_Report.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to export report.");
    } finally {
      setExportLoading(false);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: false }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#e2e8f0' } },
      x: { grid: { display: false } }
    }
  };

  const chartData = reportData ? {
    labels: reportData.chartData.labels.map(l => l.split('-').slice(1).join('/')), // MM/DD format
    datasets: [
      {
        label: 'Sales (₹)',
        data: reportData.chartData.sales,
        backgroundColor: '#10b981',
        borderRadius: 6,
      },
      {
        label: 'Expenses (₹)',
        data: reportData.chartData.expenses,
        backgroundColor: '#ef4444',
        borderRadius: 6,
      }
    ]
  } : null;

  return (
    <div style={{ paddingBottom: '3rem' }}>
      <div className="dashboard-header">
        <div>
          <h1>Financial Reports & Analytics</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Detailed breakdown for <strong>{kitchen === 'Kitchen 1' ? 'NightWokDelight' : 'Biryani Culture'}</strong></p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select value={kitchen} onChange={(e) => setKitchen(e.target.value)} className="premium-input" style={{ width: 'auto' }}>
            <option value="Kitchen 1">🌙 NightWokDelight</option>
            <option value="Kitchen 2">🍛 Biryani Culture</option>
          </select>
          <div className="glass-container" style={{ padding: '4px', borderRadius: '12px', display: 'flex' }}>
            {['daily', 'weekly', 'monthly'].map(f => (
              <button 
                key={f}
                className={`btn ${filter === f ? 'primary-btn' : 'tertiary-btn'}`}
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', border: 'none' }}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}>
          <div className="loader"></div>
          <p style={{ marginTop: '1rem', fontWeight: 600 }}>Gathering financial data...</p>
        </div>
      ) : !reportData ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--danger)' }}>
          <p>⚠️ Error loading report data. Please check your connection and try again.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
          {/* Left Column: Visuals & Tables */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Visuals Section */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3>📊 Performance Chart ({filter.charAt(0).toUpperCase() + filter.slice(1)})</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className={`btn ${viewMode === 'chart' ? 'primary-btn' : 'secondary-btn'}`} onClick={() => setViewMode('chart')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Chart View</button>
                  <button className={`btn ${viewMode === 'table' ? 'primary-btn' : 'secondary-btn'}`} onClick={() => setViewMode('table')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Table View</button>
                </div>
              </div>
              
              <div style={{ height: '350px' }}>
                {viewMode === 'chart' ? (
                  chartData && chartData.labels.length > 0 ? (
                    <Bar data={chartData} options={chartOptions} />
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                      No transaction data available for this period.
                    </div>
                  )
                ) : (
                  <div className="table-container" style={{ height: '100%', overflowY: 'auto' }}>
                    <table className="premium-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Combined Sales (₹)</th>
                          <th>Combined Expenses (₹)</th>
                          <th>Daily Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.chartData.labels.map((label, idx) => {
                          const s = reportData.chartData.sales[idx];
                          const e = reportData.chartData.expenses[idx];
                          const balance = s - e;
                          return (
                            <tr key={idx}>
                              <td>{label}</td>
                              <td style={{ color: 'var(--success)', fontWeight: 600 }}>₹{s.toLocaleString()}</td>
                              <td style={{ color: 'var(--danger)', fontWeight: 600 }}>₹{e.toLocaleString()}</td>
                              <td style={{ fontWeight: 700, color: balance >= 0 ? 'var(--accent)' : 'var(--danger)' }}>
                                {balance >= 0 ? '+' : ''}₹{balance.toLocaleString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Data Section */}
            <div className="card">
              <h3>📝 Detailed Transactions (Top 20)</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Showing latest activities for the current filtered period.</p>
              
              <div className="table-container">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Category/Source</th>
                      <th>Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...reportData.details.sales, ...reportData.details.expenses]
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .slice(0, 20)
                      .map((item, idx) => {
                        const isSale = !!item.source;
                        return (
                          <tr key={idx}>
                            <td>
                              <span style={{ 
                                padding: '4px 8px', 
                                borderRadius: '4px', 
                                fontSize: '0.7rem', 
                                fontWeight: 700, 
                                background: isSale ? '#dcfce7' : '#fee2e2', 
                                color: isSale ? '#15803d' : '#991b1b' 
                              }}>
                                {isSale ? 'SALE' : 'EXPENSE'}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.85rem' }}>{new Date(item.date).toLocaleDateString()}</td>
                            <td style={{ fontSize: '0.85rem' }}>{item.source || item.category}</td>
                            <td style={{ fontWeight: 700, color: isSale ? 'var(--success)' : 'var(--danger)' }}>
                              ₹{Number(item.amount).toLocaleString()}
                            </td>
                          </tr>
                        );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Summary & Export */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Bill Summary Section */}
            <div className="card" style={{ 
              background: '#fff', 
              border: '1px solid #000', 
              padding: '2rem', 
              boxShadow: 'none', 
              fontFamily: "'Courier New', Courier, monospace",
              position: 'relative'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 900 }}>FINANCIAL STATEMENT</h2>
                <p style={{ fontSize: '0.8rem', margin: '5px 0' }}>Period: {filter.toUpperCase()}</p>
                <div style={{ borderBottom: '2px dashed #000', margin: '15px 0' }}></div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>GROSS SALES</span>
                  <span>₹{reportData.summary.totalSales.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
                  <span>TOTAL EXPENSES</span>
                  <span>- ₹{reportData.summary.totalExpenses.toLocaleString()}</span>
                </div>
                <div style={{ borderBottom: '1px solid #000', margin: '10px 0' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '1.1rem' }}>
                  <span>NET {reportData.summary.netProfit >= 0 ? 'PROFIT' : 'LOSS'}</span>
                  <span>₹{Math.abs(reportData.summary.netProfit).toLocaleString()}</span>
                </div>
              </div>
              
              <div style={{ borderBottom: '2px dashed #000', margin: '20px 0' }}></div>
              <div style={{ textAlign: 'center', fontSize: '0.7rem' }}>
                <p>Status: {reportData.summary.netProfit >= 0 ? 'Healthy' : 'Deficit'}</p>
                <p>Generated on {new Date().toLocaleString()}</p>
              </div>

              {/* Decorative receipt zig-zag bottom */}
              <div style={{ 
                position: 'absolute', 
                bottom: '-10px', 
                left: 0, 
                right: 0, 
                height: '10px', 
                background: 'linear-gradient(-45deg, transparent 5px, white 0), linear-gradient(45deg, transparent 5px, white 0)',
                backgroundSize: '10px 10px',
                filter: 'drop-shadow(0 2px 1px rgba(0,0,0,0.1))'
              }}></div>
            </div>

            {/* Excel Export Card */}
            <div className="card" style={{ background: 'var(--primary)', color: 'white' }}>
              <h3 style={{ color: 'white', marginBottom: '1rem' }}>📁 Bulk Export</h3>
              <p style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '1.5rem' }}>
                Download a comprehensive Excel report with full transaction breakdowns.
              </p>
              
              <div className="form-group">
                <label style={{ color: 'white', opacity: 0.9 }}>From Date</label>
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="premium-input" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }} />
              </div>
              <div className="form-group">
                <label style={{ color: 'white', opacity: 0.9 }}>To Date</label>
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="premium-input" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }} />
              </div>

              <button 
                className="btn primary-btn" 
                onClick={handleExport} 
                disabled={exportLoading}
                style={{ width: '100%', justifyContent: 'center', background: 'white', color: 'var(--primary)', border: 'none' }}
              >
                {exportLoading ? '⌛ Generating...' : 'Download Excel'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default ReportsPage;
