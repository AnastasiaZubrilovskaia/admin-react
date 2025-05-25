import React, { useEffect, useState } from 'react';
import './AdminDoctors.css'; // или отдельный файл, если надо

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [filterStatus, setFilterStatus] = useState(''); // пусто = все

  // Для редактирования статуса
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.token) setToken(user.token);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchReviews();
    }
  }, [token, filterStatus]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const url = filterStatus
        ? `http://localhost:5000/api/admin/reviews?status=${filterStatus}`
        : 'http://localhost:5000/api/admin/reviews';
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setReviews(data);
      setError('');
    } catch (e) {
      setError('Ошибка загрузки отзывов: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (review) => {
    setEditingReviewId(review.id);
    setEditStatus(review.status);
  };

  const cancelEditing = () => {
    setEditingReviewId(null);
    setEditStatus('');
  };

  const saveStatus = async (id) => {
    try {
      if (!['pending', 'approved', 'rejected'].includes(editStatus)) {
        alert('Выберите корректный статус');
        return;
      }
      const res = await fetch(`http://localhost:5000/api/admin/reviews/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: editStatus }),
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchReviews();
      cancelEditing();
    } catch (e) {
      alert('Ошибка при обновлении статуса: ' + e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить отзыв?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      fetchReviews();
    } catch (e) {
      alert('Ошибка при удалении: ' + e.message);
    }
  };

  if (loading) return <p>Загрузка отзывов...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="admin-doctors-container">
      <h1>Отзывы пациентов</h1>

      <label>
        Фильтр по статусу:
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ marginLeft: 10 }}
        >
          <option value="">Все</option>
          <option value="pending">В ожидании</option>
          <option value="approved">Одобрены</option>
          <option value="rejected">Отклонены</option>
        </select>
      </label>

      <table className="admin-doctors-table" style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Пациент</th>
            <th>Врач</th>
            <th>Рейтинг</th>
            <th>Комментарий</th>
            <th>Статус</th>
            <th>Дата</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={review.id}>
              <td>{review.id}</td>
              <td>
                {review.Patient
                  ? `${review.Patient.firstName} ${review.Patient.lastName}`
                  : '—'}
              </td>
              <td>
                {review.Doctor
                  ? `${review.Doctor.firstName} ${review.Doctor.lastName}`
                  : '—'}
              </td>
              <td>{review.rating}</td>
              <td>{review.comment}</td>
              <td>
                {editingReviewId === review.id ? (
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option value="pending">В ожидании</option>
                    <option value="approved">Одобрены</option>
                    <option value="rejected">Отклонены</option>
                  </select>
                ) : (
                  review.status
                )}
              </td>
              <td>{new Date(review.createdAt).toLocaleString()}</td>
              <td>
                {editingReviewId === review.id ? (
                  <div className="action-buttons">
                    <button
                      className="save-button"
                      onClick={() => saveStatus(review.id)}
                    >
                      Сохранить
                    </button>
                    <button className="cancel-button" onClick={cancelEditing}>
                      Отмена
                    </button>
                  </div>
                ) : (
                  <div className="action-buttons">
                    <button onClick={() => startEditing(review)}>Изменить статус</button>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(review.id)}
                    >
                      Удалить
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminReviews;
