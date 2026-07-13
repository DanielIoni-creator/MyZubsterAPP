// src/pages/Login.jsx
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { login, register } from '../services/api';

const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (isLogin) {
        response = await login(email, password);
        toast.success('Login effettuato con successo! ✅');
      } else {
        response = await register(email, password, name);
        toast.success('Registrazione completata! 🎉');
      }

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Errore di autenticazione';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? 'Benvenuto' : 'Crea il tuo account'}</h2>
      <p className="subtitle">
        {isLogin ? 'Accedi al tuo account' : 'Registrati per iniziare'}
      </p>
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <input
            type="text"
            placeholder="Nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required={!isLogin}
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password (min 6 caratteri)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength="6"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Caricamento...' : (isLogin ? 'Accedi' : 'Registrati')}
        </button>
      </form>
      <button className="toggle-btn" onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
      </button>
    </div>
  );
};

export default Login;