import React, { useEffect, useState } from 'react';
import './AdminDoctors.css';

function AdminSpecialties() {
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const [newSpecialty, setNewSpecialty] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.token) setToken(user.token);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchSpecialties();
    }
  }, [token]);

  const fetchSpecialties = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/specialties', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSpecialties(data);
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить специальность?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/specialties/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      fetchSpecialties();
      if (editingId === id) setEditingId(null);
    } catch (e) {
      alert('Ошибка при удалении: ' + e.message);
    }
  };

  const startEditing = (specialty) => {
    setEditingId(specialty.id);
    setEditForm({
      name: specialty.name || '',
      description: specialty.description || '',
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async (id) => {
    if (!editForm.name.trim() || !editForm.description.trim()) {
      alert('Поля имя и описание обязательны');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/admin/specialties/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error(await res.text());
      fetchSpecialties();
      cancelEditing();
    } catch (e) {
      alert('Ошибка при сохранении: ' + e.message);
    }
  };

  const handleNewChange = (e) => {
    const { name, value } = e.target;
    setNewSpecialty((prev) => ({ ...prev, [name]: value }));
  };

  const addSpecialty = async (e) => {
    e.preventDefault();

    if (!newSpecialty.name.trim() || !newSpecialty.description.trim()) {
      alert('Поля имя и описание обязательны');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/admin/specialties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSpecialty),
      });
      if (!res.ok) throw new Error(await res.text());
      setNewSpecialty({ name: '', description: '' });
      fetchSpecialties();
    } catch (e) {
      alert('Ошибка при добавлении: ' + e.message);
    }
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p style={{ color: 'red' }}>Ошибка: {error}</p>;

  return (
    <div className="admin-doctors-container">
      <h1>Список специальностей</h1>
      <table className="admin-doctors-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Описание</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {specialties.map((spec) => (
            <tr key={spec.id}>
              <td>{spec.id}</td>
              <td>
                {editingId === spec.id ? (
                  <input
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                  />
                ) : (
                  spec.name
                )}
              </td>
              <td>
                {editingId === spec.id ? (
                  <input
                    name="description"
                    value={editForm.description}
                    onChange={handleEditChange}
                  />
                ) : (
                  spec.description
                )}
              </td>
              <td>
                {editingId === spec.id ? (
                  <div className="action-buttons">
                    <button className="save-button" onClick={() => saveEdit(spec.id)}>Сохранить</button>
                    <button className="cancel-button" onClick={cancelEditing}>Отмена</button>
                  </div>
                ) : (
                  <div className="action-buttons">
                    <button onClick={() => startEditing(spec)}>Редактировать</button>
                    <button className="delete-button" onClick={() => handleDelete(spec.id)}>Удалить</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Добавить специальность</h2>
      <form onSubmit={addSpecialty} className="doctor-form">
        <input
          name="name"
          placeholder="Название"
          value={newSpecialty.name}
          onChange={handleNewChange}
          required
        />
        <input
          name="description"
          placeholder="Описание"
          value={newSpecialty.description}
          onChange={handleNewChange}
          required
        />
        <div className="action-buttons">
          <button type="submit" className="save-button">Добавить</button>
          <button
            type="button"
            className="cancel-button"
            onClick={() => setNewSpecialty({ name: '', description: '' })}
          >
            Очистить
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminSpecialties;
