import { useNavigate } from 'react-router-dom';
import { appConfig } from '../config/appConfig';
import { useKitchen } from '../KitchenContext';

function HomePage() {
  const navigate = useNavigate();
  const { setSelectedKitchen } = useKitchen();

  const handleKitchenSelect = (kitchen) => {
    setSelectedKitchen(kitchen);
    navigate('/login');
  };

  return (
    <div className="home-container" style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '4rem 2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <img 
            src={`/${appConfig.logos.mainLogo}`} 
            alt="KitchenTrack" 
            style={{ width: '100px', height: '100px', borderRadius: '50%', marginBottom: '1.5rem', boxShadow: 'var(--shadow-lg)', objectFit: 'cover', border: '3px solid white' }} 
          />
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', letterSpacing: '-0.03em' }}>
            Meet <span style={{ color: 'var(--accent)' }}>KitchenTrack</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Smart finances for modern cloud kitchens. Monitor profit, manage expenses, and grow your business with ease.
          </p>
        </div>

        {/* Kitchen Selection Grid */}
        <div className="kitchen-grid">
          {/* Kitchen 1 */}
          <div className="kitchen-card card" onClick={() => handleKitchenSelect('Kitchen 1')}>
            <img src={`/${appConfig.logos.kitchen1}`} alt="NightWokDelight" className="kitchen-logo-large" />
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>NightWokDelight</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Late-night bowls, tracked in real-time.</p>
            <button className="btn primary-btn" style={{ width: '100%' }}>Enter Kitchen →</button>
          </div>

          {/* Kitchen 2 */}
          <div className="kitchen-card card" onClick={() => handleKitchenSelect('Kitchen 2')}>
            <img src={`/${appConfig.logos.kitchen2}`} alt="Biryani Culture" className="kitchen-logo-large" />
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Biryani Culture</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Every biryani sale & expense, in one place.</p>
            <button className="btn primary-btn" style={{ width: '100%' }}>Enter Kitchen →</button>
          </div>
        </div>

        {/* Features Minimalist */}
        <div style={{ marginTop: '5rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
            {['Monthly Auto-Reset', 'Business Metric Sync', 'Personalized Experience', 'Financial Insights', 'Excel Export'].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--secondary)' }}>
                <span style={{ color: 'var(--accent)' }}>✦</span> {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;