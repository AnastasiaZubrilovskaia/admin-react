import React, { useState, useEffect } from 'react';
import './AdminUsers.css';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [newAdmin, setNewAdmin] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    birthDate: '',
  });
  const [editUserId, setEditUserId] = useState(null);
  const [editUserData, setEditUserData] = useState({});

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.token) {
        setToken(user.token);
      }
    }
  }, []);

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Ошибка ${res.status}`);
      }
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить пользователя?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Ошибка ${res.status}`);
      }
      fetchUsers();
    } catch (e) {
      alert('Ошибка при удалении: ' + e.message);
    }
  };

  const handleEditClick = (user) => {
    setEditUserId(user.id);
    setEditUserData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      birthDate: user.birthDate ? user.birthDate.slice(0,10) : '',
      role: user.role,
    });
  };

  const handleEditChange = (e) => {
    setEditUserData({ ...editUserData, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${editUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editUserData),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Ошибка ${res.status}`);
      }
      setEditUserId(null);
      fetchUsers();
    } catch (e) {
      alert('Ошибка при сохранении: ' + e.message);
    }
  };

  const handleNewAdminChange = (e) => {
    setNewAdmin({ ...newAdmin, [e.target.name]: e.target.value });
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...newAdmin, role: 'admin' }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Ошибка ${res.status}`);
      }
      setNewAdmin({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        birthDate: '',
      });
      fetchUsers();
    } catch (e) {
      alert('Ошибка при создании администратора: ' + e.message);
    }
  };

  if (loading) return <p>Загрузка пользователей...</p>;
  if (error) return <p style={{ color: 'red' }}>Ошибка: {error}</p>;

  return (
    <div style={{ maxWidth: 900, margin: 'auto', padding: 20 }}>
      <h1>Пользователи</h1>

      <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', marginBottom: 20 }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Имя</th>
            <th>Фамилия</th>
            <th>Email</th>
            <th>Телефон</th>
            <th>Дата рождения</th>
            <th>Роль</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            editUserId === user.id ? (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td><input name="firstName" value={editUserData.firstName} onChange={handleEditChange} /></td>
                <td><input name="lastName" value={editUserData.lastName} onChange={handleEditChange} /></td>
                <td><input name="email" value={editUserData.email} onChange={handleEditChange} /></td>
                <td><input name="phone" value={editUserData.phone} onChange={handleEditChange} /></td>
                <td><input type="date" name="birthDate" value={editUserData.birthDate} onChange={handleEditChange} /></td>
                <td>
                  <select name="role" value={editUserData.role} onChange={handleEditChange}>
                    <option value="patient">Пациент</option>
                    <option value="admin">Админ</option>
                  </select>
                </td>
                <td>
                    <div className="action-buttons">
                        <button onClick={handleEditSave}>Сохранить</button>
                        <button onClick={() => setEditUserId(null)}>Отмена</button>
                    </div>
                </td>

              </tr>
            ) : (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>{user.birthDate ? user.birthDate.slice(0,10) : ''}</td>
                <td>{user.role}</td>
                <td>
                    <div className="action-buttons">
                        <button onClick={() => handleEditClick(user)}>Редактировать</button>
                        <button onClick={() => handleDelete(user.id)} className="delete-button">Удалить</button>
                    </div>
                </td>
              </tr>
            )
          ))}
        </tbody>
      </table>

      <h2>Создать администратора</h2>
      <form onSubmit={handleCreateAdmin} style={{ maxWidth: 400 }}>
        <input
          type="text"
          name="firstName"
          placeholder="Имя"
          value={newAdmin.firstName}
          onChange={handleNewAdminChange}
          required
          style={{ width: '100%', marginBottom: 8 }}
        />
        <input
          type="text"
          name="lastName"
          placeholder="Фамилия"
          value={newAdmin.lastName}
          onChange={handleNewAdminChange}
          required
          style={{ width: '100%', marginBottom: 8 }}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={newAdmin.email}
          onChange={handleNewAdminChange}
          required
          style={{ width: '100%', marginBottom: 8 }}
        />
        <input
          type="password"
          name="password"
          placeholder="Пароль"
          value={newAdmin.password}
          onChange={handleNewAdminChange}
          required
          style={{ width: '100%', marginBottom: 8 }}
        />
        <input
          type="text"
          name="phone"
          placeholder="Телефон"
          value={newAdmin.phone}
          onChange={handleNewAdminChange}
          required
          style={{ width: '100%', marginBottom: 8 }}
        />
        <input
          type="date"
          name="birthDate"
          placeholder="Дата рождения"
          value={newAdmin.birthDate}
          onChange={handleNewAdminChange}
          required
          style={{ width: '100%', marginBottom: 8 }}
        />
        <button type="submit" style={{ padding: 8, width: '100%' }}>Создать администратора</button>
      </form>
    </div>
  );
}

export default AdminUsers;
