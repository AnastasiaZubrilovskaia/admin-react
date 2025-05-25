import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <header style={styles.header}>
      <Link to="/" style={styles.clinicName}>
        Поликлиника
      </Link>

      <nav style={styles.nav}>
        {user ? (
          <>
            <Link to="/admin/doctors" style={styles.link}>Врачи</Link>
            <Link to="/admin/specialties" style={styles.link}>Специальности</Link>
            <Link to="/admin/users" style={styles.link}>Пользователи</Link>
            <Link to="/admin/statistics" style={styles.link}>Аналитика</Link>
            <Link to="/admin/appointments" style={styles.link}>Записи</Link>
            <Link to="/admin/reviews" style={styles.link}>Отзывы</Link>
            <button onClick={handleLogout} style={styles.button}>Выход</button>
          </>
        ) : (
          <Link to="/login" style={styles.link}>Войти</Link>
        )}
      </nav>
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: '#1976d2',
    padding: '10px 30px',
    color: '#ffffff',
    display: 'flex',
    justifyContent: 'space-between', 
    alignItems: 'center',
  },
  clinicName: {
    fontWeight: 'normal',
    fontSize: '18px',
    color: '#ffffff',
    textDecoration: 'none',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  link: {
    color: '#ffffff',
    textDecoration: 'none',
    fontWeight: 'normal',
    fontSize: '16px',
    marginRight: '15px',
  },
  button: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#ffffff',
    fontWeight: 'normal',
    cursor: 'pointer',
    fontSize: '16px',
  },
};

export default Header;
