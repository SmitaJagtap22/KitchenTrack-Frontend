import React, { useState, useEffect, useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import api from '../api';
import { useKitchen } from '../KitchenContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

function SalesAnalyticsPage() {
    const { selectedKitchen, setSelectedKitchen } = useKitchen();
    const [sales, setSales] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAnalyticsData = async (kitchen) => {
        setLoading(true);
        try {
            const [salesRes, expensesRes] = await Promise.all([
                api.get(`/api/sales?kitchen=${encodeURIComponent(kitchen)}`),
                api.get(`/api/expenses?kitchen=${encodeURIComponent(kitchen)}`),
            ]);
            setSales(salesRes.data || []);
            setExpenses(expensesRes.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalyticsData(selectedKitchen);
    }, [selectedKitchen]);

    const metrics = useMemo(() => {
        const totalNetSales = sales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
        const numOrders = sales.length;
        const offersSales = sales.filter(s => (s.source || '').toLowerCase().includes('offer')).reduce((sum, s) => sum + Number(s.amount || 0), 0);
        const adsSales = sales.filter(s => (s.source || '').toLowerCase().includes('ad')).reduce((sum, s) => sum + Number(s.amount || 0), 0);
        const adSpend = expenses.filter(e => (e.category || '').toLowerCase().includes('advertising') || (e.title || '').toLowerCase().includes('ad')).reduce((sum, e) => sum + Number(e.amount || 0), 0);
        return { totalNetSales, numOrders, offersSales, adsSales, adSpend };
    }, [sales, expenses]);

    const sourceChartData = useMemo(() => {
        const sourceMap = {};
        sales.forEach(s => { sourceMap[s.source || 'Direct'] = (sourceMap[s.source || 'Direct'] || 0) + Number(s.amount); });
        return {
            labels: Object.keys(sourceMap),
            datasets: [{
                data: Object.values(sourceMap),
                backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
                hoverOffset: 10
            }]
        };
    }, [sales]);

    return (
        <div>
            <div className="dashboard-header">
                <div>
                    <h1>Sales Analytics</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Deep dive into revenue for <strong>{selectedKitchen}</strong></p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <select value={selectedKitchen} onChange={(e) => setSelectedKitchen(e.target.value)} className="premium-input" style={{ width: 'auto' }}>
                        <option value="Kitchen 1">🌙 NightWokDelight</option>
                        <option value="Kitchen 2">🍛 Biryani Culture</option>
                    </select>
                </div>
            </div>

            {loading ? <p>Loading Analytics...</p> : (
                <>
                    <div className="summary-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                        <div className="card">
                            <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>TOTAL NET SALES</h4>
                            <h3 style={{ fontSize: '1.75rem' }}>₹{metrics.totalNetSales.toLocaleString('en-IN')}</h3>
                        </div>
                        <div className="card">
                            <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>TOTAL ORDERS</h4>
                            <h3 style={{ fontSize: '1.75rem' }}>{metrics.numOrders}</h3>
                        </div>
                        <div className="card">
                            <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>OFFER SALES</h4>
                            <h3 style={{ fontSize: '1.75rem', color: 'var(--success)' }}>₹{metrics.offersSales.toLocaleString('en-IN')}</h3>
                        </div>
                        <div className="card">
                            <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>AD SALES</h4>
                            <h3 style={{ fontSize: '1.75rem', color: '#8b5cf6' }}>₹{metrics.adsSales.toLocaleString('en-IN')}</h3>
                        </div>
                        <div className="card">
                            <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>AD SPEND</h4>
                            <h3 style={{ fontSize: '1.75rem', color: 'var(--danger)' }}>₹{metrics.adSpend.toLocaleString('en-IN')}</h3>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginTop: '2.5rem' }}>
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <h3 style={{ marginBottom: '2rem', width: '100%' }}>Revenue Breakdown</h3>
                            <div style={{ height: '280px', width: '280px' }}>
                                <Doughnut data={sourceChartData} options={{ maintainAspectRatio: false }} />
                            </div>
                        </div>
                        <div className="card">
                            <h3 style={{ marginBottom: '2rem' }}>Analytics Insight</h3>
                            <div style={{ padding: '1rem', background: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                                    Your <strong>{selectedKitchen === 'Kitchen 1' ? 'NightWokDelight' : 'Biryani Culture'}</strong> is currently seeing
                                    {metrics.totalNetSales > 0 ? ` ₹${(metrics.adsSales / metrics.totalNetSales * 100).toFixed(1)}% ` : ' 0% '}
                                    of revenue directly from paid advertisements.
                                    The <strong>Ad Spend Efficiency</strong> is currently
                                    {metrics.adSpend > 0 ? ` ${(metrics.adsSales / metrics.adSpend).toFixed(1)}x ROI.` : ' N/A.'}
                                </p>
                                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                                    <div style={{ flex: 1, padding: '1rem', background: 'white', border: '1px solid var(--border)', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Marketing ROI</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>{metrics.adSpend > 0 ? (metrics.adsSales / metrics.adSpend).toFixed(2) : '0.00'}</div>
                                    </div>
                                    <div style={{ flex: 1, padding: '1rem', background: 'white', border: '1px solid var(--border)', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Avg. Order Value</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>₹{metrics.numOrders > 0 ? (metrics.totalNetSales / metrics.numOrders).toFixed(0) : '0'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default SalesAnalyticsPage;
