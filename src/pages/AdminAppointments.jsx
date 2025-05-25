import React, { useEffect, useState } from 'react';
import './AdminDoctors.css'; 

function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.token) setToken(user.token);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchAppointments();
    }
  }, [token, filterStatus]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/appointments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const filtered = filterStatus ? data.filter((a) => a.status === filterStatus) : data;
      setAppointments(filtered);
      setError('');
    } catch (e) {
      setError('Ошибка загрузки записей: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (appointment) => {
    setEditingId(appointment.id);
    setEditStatus(appointment.status);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditStatus('');
  };

  const saveStatus = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: editStatus }),
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchAppointments();
      cancelEditing();
    } catch (e) {
      alert('Ошибка обновления: ' + e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить запись?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/appointments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      fetchAppointments();
    } catch (e) {
      alert('Ошибка при удалении: ' + e.message);
    }
  };

  if (loading) return <p>Загрузка записей...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="admin-doctors-container">
      <h1>Записи</h1>

      <label>
        Фильтр по статусу:
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ marginLeft: 10 }}
        >
          <option value="">Все</option>
          <option value="scheduled">Запланированы</option>
          <option value="completed">Завершены</option>
          <option value="cancelled">Отменены</option>
        </select>
      </label>

      <table className="admin-doctors-table" style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Пациент</th>
            <th>Врач</th>
            <th>Специальность</th>
            <th>Дата</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((a) => (
            <tr key={a.id}>
              <td>{a.id}</td>
              <td>
                {a.Patient
                  ? `${a.Patient.firstName} ${a.Patient.lastName}`
                  : '—'}
              </td>
              <td>
                {a.Doctor
                  ? `${a.Doctor.firstName} ${a.Doctor.lastName}`
                  : '—'}
              </td>
              <td>{a.Doctor?.Specialty?.name || '—'}</td>
              <td>{new Date(a.appointment_date).toLocaleString()}</td>
              <td>
                {editingId === a.id ? (
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option value="scheduled">Запланирована</option>
                    <option value="completed">Завершена</option>
                    <option value="cancelled">Отменена</option>
                  </select>
                ) : (
                  a.status
                )}
              </td>
              <td>
                {editingId === a.id ? (
                  <>
                    <button onClick={() => saveStatus(a.id)}>Сохранить</button>
                    <button onClick={cancelEditing}>Отмена</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEditing(a)}>Изменить статус</button>
                    <button className="delete-button" onClick={() => handleDelete(a.id)}>Удалить</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminAppointments;
