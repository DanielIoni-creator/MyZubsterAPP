// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getOrders, createOrder, startPayment, getPaymentStatus, cancelOrder } from '../services/api';

const Dashboard = ({ user, onLogout }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [paying, setPaying] = useState(false);
  const [newOrder, setNewOrder] = useState({ 
    items: [{ name: '', quantity: 1, price: 0 }], 
    total: 0 
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await getOrders();
      setOrders(response.data.orders || []);
    } catch (error) {
      toast.error('Errore caricamento ordini');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (newOrder.items.some(item => !item.name || item.price <= 0)) {
      toast.warning('Compila tutti i campi correttamente');
      return;
    }
    setCreating(true);
    try {
      const response = await createOrder(
        newOrder.items,
        newOrder.total,
        'XMR'
      );
      toast.success(`Ordine creato! ID: ${response.data.order.orderNumber}`);
      setNewOrder({ items: [{ name: '', quantity: 1, price: 0 }], total: 0 });
      await loadOrders();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Errore creazione ordine');
    } finally {
      setCreating(false);
    }
  };

  const handlePayOrder = async (orderId, amount) => {
    setPaying(true);
    try {
      const response = await startPayment(orderId, amount);
      const paymentId = response.data.payment.id;
      toast.info(`Pagamento avviato! Payment ID: ${paymentId}`);
      
      setTimeout(async () => {
        try {
          const statusRes = await getPaymentStatus(paymentId);
          if (statusRes.data.status === 'confirmed') {
            toast.success('✅ Pagamento confermato!');
          } else {
            toast.info(`Stato: ${statusRes.data.status}`);
          }
          await loadOrders();
        } catch (err) {
          toast.error('Errore verifica stato');
        } finally {
          setPaying(false);
        }
      }, 4000);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Errore pagamento');
      setPaying(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Annullare questo ordine?')) return;
    try {
      await cancelOrder(orderId);
      toast.success('Ordine annullato!');
      await loadOrders();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Errore annullamento');
    }
  };

  const addItem = () => {
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { name: '', quantity: 1, price: 0 }]
    });
  };

  const removeItem = (index) => {
    const items = newOrder.items.filter((_, i) => i !== index);
    const total = items.reduce((sum, i) => sum + (i.quantity * i.price), 0);
    setNewOrder({ ...newOrder, items, total });
  };

  const updateItem = (index, field, value) => {
    const items = [...newOrder.items];
    items[index][field] = value;
    const total = items.reduce((sum, i) => sum + (i.quantity * i.price), 0);
    setNewOrder({ ...newOrder, items, total });
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="dashboard-header">
        <h1>📦 MyZubster</h1>
        <div className="user-info">
          <span>👋 {user?.name || 'Utente'}</span>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      <h2 className="section-title">I tuoi ordini</h2>
      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📭</div>
          <h3>Nessun ordine</h3>
          <p>Non hai ancora creato ordini. Inizia qui sotto!</p>
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="order-number">{order.orderNumber}</span>
                <span className={`order-status ${order.status}`}>
                  {order.status}
                </span>
              </div>
              <div className="order-details">
                <p><strong>Totale:</strong> {order.total} {order.currency}</p>
                <p><strong>Items:</strong> {order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</p>
                {order.paymentStatus === 'confirmed' && (
                  <p style={{ color: '#059669', fontWeight: 600 }}>✅ Pagato</p>
                )}
              </div>
              <div className="order-actions">
                {order.status === 'pending' && (
                  <>
                    <button 
                      className="btn-pay" 
                      onClick={() => handlePayOrder(order._id, order.total)}
                      disabled={paying}
                    >
                      {paying ? '⏳' : `Paga ${order.total} ${order.currency}`}
                    </button>
                    <button 
                      className="btn-cancel" 
                      onClick={() => handleCancelOrder(order._id)}
                    >
                      Annulla
                    </button>
                  </>
                )}
                {order.status === 'paid' && (
                  <button className="btn-disabled" disabled>
                    ✅ Pagato
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="section-title">🛒 Nuovo ordine</h2>
      <form className="create-order-form" onSubmit={handleCreateOrder}>
        {newOrder.items.map((item, index) => (
          <div key={index} className="item-row">
            <input
              placeholder="Nome prodotto"
              value={item.name}
              onChange={(e) => updateItem(index, 'name', e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Qty"
              value={item.quantity}
              onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
              min="1"
              required
            />
            <input
              type="number"
              placeholder="Prezzo"
              value={item.price}
              onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
              required
            />
            {newOrder.items.length > 1 && (
              <button type="button" className="remove-btn" onClick={() => removeItem(index)}>
                ✕
              </button>
            )}
          </div>
        ))}
        <button type="button" className="add-item-btn" onClick={addItem}>
          + Aggiungi item
        </button>
        <div className="form-footer">
          <span className="total">Totale: {newOrder.total} XMR</span>
          <button type="submit" className="create-btn" disabled={creating}>
            {creating ? 'Creazione...' : 'Crea Ordine'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Dashboard;