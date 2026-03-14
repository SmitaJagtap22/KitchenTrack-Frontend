import React from 'react';

const ICONS = {
  danger: '📉',
  success: '📈',
  neutral: '📊',
};

function SummaryCard({ title, value, type = 'neutral' }) {
  const color = type === 'success' ? 'var(--success)' : type === 'danger' ? 'var(--danger)' : 'var(--accent)';
  
  return (
    <div className="card" style={{ borderLeft: `6px solid ${color}`, display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
      <div style={{ 
        width: '56px', 
        height: '56px', 
        borderRadius: '14px', 
        background: 'var(--background)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
      }}>
        {ICONS[type]}
      </div>
      <div>
        <p style={{ margin: 0, textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>{title}</p>
        <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>{value}</p>
      </div>
    </div>
  );
}

export default SummaryCard;
