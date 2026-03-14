import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { appConfig } from '../config/appConfig';

function LoginPage() {
  const navigate = useNavigate();
  const [isOwner, setIsOwner] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const role = isOwner ? 'owner' : 'chef';
      const res = await api.post('/api/login', { username, password });

      if (res.data.success && res.data.user.role === role) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', role);
        localStorage.setItem('loggedInUser', username);
        navigate(isOwner ? '/dashboard' : '/expenses/add');
      } else {
        setError('Invalid credentials for this role.');
      }
    } catch (err) {
      setError('Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{
      background: 'linear-gradient(rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.9)), url("https://images.unsplash.com/photo-1556910103-1c02745aae4d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80")',
      backgroundSize: 'cover',
    }}>
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <img src={`/${appConfig.logos.mainLogo}`} alt="Logo" style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '1rem', objectFit: 'cover', border: '2px solid var(--border)' }} />
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Please enter your details to continue</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="role-selector" style={{ display: 'flex', background: 'var(--background)', borderRadius: '12px', padding: '4px', marginBottom: '2rem' }}>
            <button type="button" onClick={() => setIsOwner(true)} style={{ flex: 1, padding: '10px', borderRadius: '10px', background: isOwner ? 'white' : 'transparent', fontWeight: 700, color: isOwner ? 'var(--primary)' : 'var(--text-secondary)', boxShadow: isOwner ? 'var(--shadow-sm)' : 'none', border: 'none' }}>Owner</button>
            <button type="button" onClick={() => setIsOwner(false)} style={{ flex: 1, padding: '10px', borderRadius: '10px', background: !isOwner ? 'white' : 'transparent', fontWeight: 700, color: !isOwner ? 'var(--primary)' : 'var(--text-secondary)', boxShadow: !isOwner ? 'var(--shadow-sm)' : 'none', border: 'none' }}>Chef</button>
          </div>

          <div className="form-group">
            <label>Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="premium-input" placeholder="Enter username" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="premium-input" placeholder="••••••••" required />
          </div>

          <button type="submit" className="btn primary-btn" style={{ width: '100%', justifyContent: 'center', height: '50px' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {error && <div style={{ marginTop: '1.5rem', color: 'var(--danger)', fontSize: '0.85rem', textAlign: 'center', fontWeight: 600 }}>{error}</div>}
      </div>
    </div>
  );
}

export default LoginPage;
