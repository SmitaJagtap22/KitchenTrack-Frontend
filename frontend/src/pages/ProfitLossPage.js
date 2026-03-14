import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import api from '../api';
import { useKitchen } from '../KitchenContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

function ProfitLossPage() {
    const navigate = useNavigate();
    const { selectedKitchen: kitchen } = useKitchen();
    const [loading, setLoading] = useState(true);

    const [totalSales, setTotalSales] = useState(0);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [comparisonChartData, setComparisonChartData] = useState({ labels: [], datasets: [] });
    const [monthlyTrendData, setMonthlyTrendData] = useState({ labels: [], datasets: [] });

    const kitchenName = kitchen === 'Kitchen 1' ? 'NightWokDelight' : 'Biryani Culture';

    const formatMonthKey = (value) => {
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return null;
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    };

    useEffect(() => {
        const fetchPLData = async () => {
            setLoading(true);
            try {
                const [expenseRes, salesRes] = await Promise.all([
                    api.get(`/api/expenses?kitchen=${encodeURIComponent(kitchen)}`),
                    api.get(`/api/sales?kitchen=${encodeURIComponent(kitchen)}`),
                ]);

                const expenses = expenseRes.data || [];
                const sales = salesRes.data || [];

                const expSum = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
                const salesSum = sales.reduce((sum, item) => sum + Number(item.amount), 0);
                setTotalExpenses(expSum);
                setTotalSales(salesSum);

                setComparisonChartData({
                    labels: ['Overall'],
                    datasets: [
                        { label: 'Revenue', data: [salesSum], backgroundColor: '#10b981', borderRadius: 8 },
                        { label: 'Expenses', data: [expSum], backgroundColor: '#ef4444', borderRadius: 8 }
                    ]
                });

                const moMapE = {}; const moMapS = {};
                expenses.forEach(i => { const k = formatMonthKey(i.date); if (k) moMapE[k] = (moMapE[k] || 0) + Number(i.amount || 0); });
                sales.forEach(i => { const k = formatMonthKey(i.date); if (k) moMapS[k] = (moMapS[k] || 0) + Number(i.amount || 0); });

                const sortedMos = Object.keys({ ...moMapE, ...moMapS }).sort().slice(-6);
                const mE = sortedMos.map(k => moMapE[k] || 0);
                const mS = sortedMos.map(k => moMapS[k] || 0);
                const mP = sortedMos.map((k, idx) => mS[idx] - mE[idx]);

                setMonthlyTrendData({
                    labels: sortedMos,
                    datasets: [
                        {
                            label: 'Net Profits',
                            data: mP,
                            borderColor: '#f97316',
                            backgroundColor: 'rgba(249, 115, 22, 0.1)',
                            borderWidth: 3,
                            tension: 0.4,
                            fill: true,
                            pointRadius: 5,
                            pointBackgroundColor: '#f97316',
                        }
                    ]
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPLData();
    }, [kitchen]);

    const netProfit = totalSales - totalExpenses;
    const isProfit = netProfit >= 0;

    return (
        <div>
            <div className="dashboard-header">
                <div>
                    <h1>Profit & Loss Statement</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Performance analysis for <strong>{kitchenName}</strong></p>
                </div>
                <button className="btn tertiary-btn" onClick={() => navigate('/dashboard')}>← Back</button>
            </div>

            {loading ? (
                <p>Analyzing financials...</p>
            ) : (
                <>
                    <div className="summary-grid">
                        <div className="card" style={{ borderTop: '4px solid var(--success)' }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>TOTAL REVENUE</p>
                            <h2 style={{ color: 'var(--success)' }}>₹{totalSales.toLocaleString('en-IN')}</h2>
                        </div>
                        <div className="card" style={{ borderTop: '4px solid var(--danger)' }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>TOTAL COSTS</p>
                            <h2 style={{ color: 'var(--danger)' }}>₹{totalExpenses.toLocaleString('en-IN')}</h2>
                        </div>
                        <div className="card" style={{ borderTop: `4px solid ${isProfit ? 'var(--accent)' : 'var(--danger)'}` }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{isProfit ? 'NET PROFIT' : 'NET LOSS'}</p>
                            <h2 style={{ color: isProfit ? 'var(--accent)' : 'var(--danger)' }}>₹{Math.abs(netProfit).toLocaleString('en-IN')}</h2>
                            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                Margin: {totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) : 0}%
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginTop: '2.5rem' }}>
                        <div className="card">
                            <h3 style={{ marginBottom: '1.5rem' }}>📊 Revenue vs Expenditure</h3>
                            <Bar data={comparisonChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} height={180} />
                        </div>
                        <div className="card">
                            <h3 style={{ marginBottom: '1.5rem' }}>📈 Monthly Net Trend</h3>
                            <Line data={monthlyTrendData} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} height={180} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default ProfitLossPage;
