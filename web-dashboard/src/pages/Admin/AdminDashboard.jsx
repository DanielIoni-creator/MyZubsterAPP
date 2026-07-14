// src/pages/Admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchDashboard();
    fetchOrders();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      } else {
        toast.error(data.error || 'Errore caricamento dashboard');
      }
    } catch (error) {
      toast.error('Errore caricamento dashboard');
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/orders?limit=20', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        toast.error(data.error || 'Errore caricamento ordini');
      }
    } catch (error) {
      toast.error('Errore caricamento ordini');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    if (updating) return;
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Ordine aggiornato con successo');
        fetchOrders();
      } else {
        toast.error(data.error || 'Errore aggiornamento ordine');
      }
    } catch (error) {
      toast.error('Errore aggiornamento ordine');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700' }}>🛡️ Admin Panel</h1>
        <span style={{ color: '#6b7280', fontSize: '14px' }}>
          Ultimo aggiornamento: {new Date().toLocaleString()}
        </span>
      </div>

      {/* Statistiche */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '30px'
        }}>
          <div className="order-card" style={{ background: '#e3f2fd', borderLeft: '4px solid #1976d2' }}>
            <h3 style={{ fontSize: '14px', color: '#6b7280' }}>📦 Ordini totali</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '4px 0 0 0' }}>{stats.totalOrders}</p>
          </div>
          <div className="order-card" style={{ background: '#e8f5e9', borderLeft: '4px solid #388e3c' }}>
            <h3 style={{ fontSize: '14px', color: '#6b7280' }}>✅ Pagati</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '4px 0 0 0' }}>{stats.paidOrders}</p>
          </div>
          <div className="order-card" style={{ background: '#fff3e0', borderLeft: '4px solid #f57c00' }}>
            <h3 style={{ fontSize: '14px', color: '#6b7280' }}>⏳ In attesa</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '4px 0 0 0' }}>{stats.pendingOrders}</p>
          </div>
          <div className="order-card" style={{ background: '#f3e5f5', borderLeft: '4px solid #7b1fa2' }}>
            <h3 style={{ fontSize: '14px', color: '#6b7280' }}>💰 Totale incasso</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '4px 0 0 0' }}>{stats.totalRevenue || 0} XMR</p>
          </div>
          <div className="order-card" style={{ background: '#fce4ec', borderLeft: '4px solid #c62828' }}>
            <h3 style={{ fontSize: '14px', color: '#6b7280' }}>👥 Utenti</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '4px 0 0 0' }}>{stats.totalUsers}</p>
          </div>
          <div className="order-card" style={{ background: '#e0f7fa', borderLeft: '4px solid #00838f' }}>
            <h3 style={{ fontSize: '14px', color: '#6b7280' }}>📊 Conversione</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '4px 0 0 0' }}>{stats.conversionRate || 0}%</p>
          </div>
        </div>
      )}

      {/* Lista ordini */}
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>📋 Ultimi ordini</h2>
      {orders.length === 0 ? (
        <div className="empty-state">
          <p>Nessun ordine trovato</p>
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map(order => (
            <div key={order._id} className="order-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="order-number" style={{ fontWeight: '600' }}>{order.orderNumber}</span>
                <span className={`order-status ${order.status}`}>{order.status}</span>
              </div>
              <div className="order-details" style={{ marginTop: '12px' }}>
                <p><strong>Utente:</strong> {order.userId?.name || order.userId?.email || 'N/A'}</p>
                <p><strong>Totale:</strong> {order.total} {order.currency}</p>
                <p><strong>Items:</strong> {order.items?.length || 0}</p>
                <p><strong>Pagamento:</strong> {order.paymentStatus}</p>
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="order-actions" style={{ marginTop: '12px' }}>
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                  disabled={updating}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    background: 'white',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  <option value="pending">⏳ In attesa</option>
                  <option value="paid">✅ Pagato</option>
                  <option value="processing">🔄 In elaborazione</option>
                  <option value="shipped">📦 Spedito</option>
                  <option value="delivered">✅ Consegnato</option>
                  <option value="cancelled">❌ Annullato</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;