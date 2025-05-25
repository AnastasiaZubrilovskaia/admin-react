import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import AdminUsers from './pages/AdminUsers';
import AdminDoctors from './pages/AdminDoctors'; 
import AdminSpecialties from './pages/AdminSpecialties';
import AdminReviews from './pages/AdminReviews';
import AdminAppointments from './pages/AdminAppointments';
import AdminStatistics from './pages/AdminStatistics';
import './AuthForm.css';

const Home = () => <h1>Главная</h1>;

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Ошибка при входе');
        return;
      }

      if (data.patient.role !== 'admin') {
        setError('Доступ разрешён только администраторам');
        return;
      }

      const userData = {
        id: data.patient.id,
        firstName: data.patient.firstName,
        lastName: data.patient.lastName,
        email: data.patient.email,
        role: data.patient.role,
        token: data.token,
      };

      localStorage.setItem('user', JSON.stringify(userData));
      onLogin(userData);
    } catch (err) {
      setError('Ошибка сети');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Вход</h2>
      {error && <p className="error">{error}</p>}
      <div className="form-group">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="btn">Войти</button>
    </form>
  );
};

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const login = (userData) => setUser(userData);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <Router>
      <Header user={user} onLogout={logout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={login} />} />
        
        <Route path="/admin/doctors" element={user && user.role === 'admin' ? <AdminDoctors /> : <Navigate to="/login" />} />
        
        <Route path="/admin/specialties" element={user && user.role === 'admin' ? <AdminSpecialties /> : <Navigate to="/login" />}/>
        <Route path="/users" element={user && user.role === 'admin' ? <AdminUsers /> : <Navigate to="/login" />} />
        <Route path="/admin/statistics" element={user && user.role === 'admin' ? <AdminStatistics /> : <Navigate to="/login" />} />
        <Route path="/admin/appointments" element={user && user.role === 'admin' ? <AdminAppointments /> : <Navigate to="/login" />}/>
        <Route path="/admin/reviews" element={user && user.role === 'admin' ? <AdminReviews /> : <Navigate to="/login" />}/>
        <Route path="/admin/users" element={user && user.role === 'admin' ? <AdminUsers /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
