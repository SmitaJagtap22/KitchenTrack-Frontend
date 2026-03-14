import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { useKitchen } from '../KitchenContext';

function TeamPage() {
  const [staff, setStaff] = useState([]);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    role: 'Chef',
    phone: '',
    email: ''
  });

  const { selectedKitchen } = useKitchen();
  /**const userRole = localStorage.getItem('userRole');**/

  const fetchTeamData = useCallback(async () => {
    setLoading(true);
    try {
      const [staffRes, ownerRes] = await Promise.all([
        api.get(`/api/staff?kitchen=${encodeURIComponent(selectedKitchen)}`),
        api.get(`/api/owner?kitchen=${encodeURIComponent(selectedKitchen)}`)
      ]);
      setStaff(staffRes.data.filter(s => s.role !== 'Owner'));
      setOwner(ownerRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedKitchen]);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      await api.post('/api/staff/add', { ...formData, kitchen: selectedKitchen });
      setFormData({ name: '', role: 'Chef', phone: '', email: '' });
      fetchTeamData();
    } catch (err) {
      alert("Failed to add employee.");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this employee?")) return;
    try {
      await api.delete(`/api/staff/${id}`);
      fetchTeamData();
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="dashboard-header">
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Team Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Manage roles and access for <strong>{selectedKitchen}</strong></p>
        </div>
      </div>

      {/* Owner Section */}
      <div className="card" style={{ marginBottom: '2.5rem', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', color: 'white', display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
          👑
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: 600, letterSpacing: '1px' }}>KITCHEN OWNER</div>
          <h2 style={{ color: 'white', margin: '5px 0', fontSize: '1.8rem' }}>{owner ? owner.name : 'Not Assigned'}</h2>
          <div style={{ display: 'flex', gap: '20px', fontSize: '0.9rem', opacity: 0.9 }}>
            <span>📞 {owner?.phone || 'N/A'}</span>
            <span>✉️ {owner?.email || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Add Employee Form */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent)', paddingLeft: '1rem' }}>Add Employee Details</h3>
          <form onSubmit={handleAddEmployee}>
            <div className="form-group">
              <label>Employee Name</label>
              <input
                type="text"
                className="premium-input"
                placeholder="Ex. Rahul Kumar"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Role / Position</label>
              <select
                className="premium-input"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="Chef">Chef</option>
                <option value="Staff">Kitchen Staff</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
            <div className="form-group">
              <label>Contact Number</label>
              <input
                type="text"
                className="premium-input"
                placeholder="10-digit mobile"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Email ID (Optional)</label>
              <input
                type="email"
                className="premium-input"
                placeholder="example@mail.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <button type="submit" className="btn primary-btn" style={{ width: '100%', justifyContent: 'center', height: '50px' }} disabled={adding}>
              {adding ? 'Adding...' : 'Add to Team'}
            </button>
          </form>
        </div>

        {/* Employee List */}
        <div>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Current Employees
            <span style={{ fontSize: '0.8rem', background: 'var(--background)', padding: '4px 12px', borderRadius: '20px', color: 'var(--text-secondary)' }}>{staff.length} Active</span>
          </h3>
          <div className="table-container card" style={{ padding: 0 }}>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
            ) : staff.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No employees added yet.</div>
            ) : (
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Staff Name</th>
                    <th>Role</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map(member => (
                    <tr key={member._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{member.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{member.phone}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', background: 'var(--background)', borderRadius: '4px' }}>
                          {member.role.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDelete(member._id)}
                          style={{ border: 'none', background: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.2rem' }}
                          title="Remove Entry"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeamPage;
