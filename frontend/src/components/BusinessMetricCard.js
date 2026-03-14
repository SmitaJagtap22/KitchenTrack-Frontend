import React from 'react';

function BusinessMetricCard({ name, value, change, emoji }) {
    const isPositive = change > 0;
    const isNegative = change < 0;

    const changeStr = isPositive ? `+${change}%` : isNegative ? `${change}%` : `0%`;
    const trendColor = isPositive ? 'var(--success)' : isNegative ? 'var(--danger)' : 'var(--text-secondary)';

    return (
        <div className="card" style={{ padding: '1.25rem', minHeight: '140px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{name}</span>
                <span style={{ fontSize: '1.2rem' }}>{emoji || '📊'}</span>
            </div>
            
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                {value}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: 700, 
                    color: trendColor,
                    background: isPositive ? 'rgba(16, 185, 129, 0.1)' : isNegative ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0,0,0,0.05)',
                    padding: '2px 8px',
                    borderRadius: '6px'
                }}>
                    {changeStr}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>vs last month</span>
            </div>
        </div>
    );
}

export default BusinessMetricCard;
