import React, { useEffect, useState } from 'react';
import './AdminStatistics.css';

function AdminStatistics() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generalStats, setGeneralStats] = useState(null);
  const [appointmentsAnalytics, setAppointmentsAnalytics] = useState([]);
  const [doctorsPerformance, setDoctorsPerformance] = useState([]);
  const [popularSpecialties, setPopularSpecialties] = useState([]);
  const [timePeriod, setTimePeriod] = useState('month');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.token) setToken(user.token);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchStatistics();
    }
  }, [token, timePeriod]);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [general, analytics, doctors, specialties] = await Promise.all([
        fetch('http://localhost:5000/api/admin/statistics/general', { headers }).then(r => r.json()),
        fetch(`http://localhost:5000/api/admin/statistics/appointments?period=${timePeriod}`, { headers }).then(r => r.json()),
        fetch('http://localhost:5000/api/admin/statistics/doctors', { headers }).then(r => r.json()),
        fetch('http://localhost:5000/api/admin/statistics/specialties', { headers }).then(r => r.json()),
      ]);

      setGeneralStats(general);
      setAppointmentsAnalytics(analytics.data);
      setDoctorsPerformance(doctors);
      setPopularSpecialties(specialties);
      setError('');
    } catch (e) {
      setError('Ошибка загрузки статистики: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Загрузка статистики...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="admin-statistics-container">
      <h1>Статистика</h1>

      <section>
        <h2>Общая статистика</h2>
        <ul>
          <li>Пациенты: {generalStats.totalPatients}</li>
          <li>Врачи: {generalStats.totalDoctors}</li>
          <li>Записи: {generalStats.totalAppointments}</li>
          <li>Специальности: {generalStats.totalSpecialties}</li>
          <li>Ближайшие записи: {generalStats.upcomingAppointments}</li>
          <li>Отзывы в ожидании: {generalStats.pendingReviews}</li>
        </ul>
      </section>

      <section>
        <h2>Аналитика записей</h2>
        <label>
          Период:
          <select value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)}>
            <option value="day">День</option>
            <option value="week">Неделя</option>
            <option value="month">Месяц</option>
            <option value="year">Год</option>
          </select>
        </label>
        <table className="analytics-table">
          <thead>
            <tr>
              <th>Период</th>
              <th>Всего</th>
              <th>Завершено</th>
              <th>Отменено</th>
            </tr>
          </thead>
          <tbody>
            {appointmentsAnalytics.map((row, idx) => (
              <tr key={idx}>
                <td>{row[timePeriod]}</td>
                <td>{row.count}</td>
                <td>{row.completed}</td>
                <td>{row.cancelled}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Топ врачи</h2>
        <table className="analytics-table">
          <thead>
            <tr>
              <th>Имя</th>
              <th>Специальность</th>
              <th>Записей</th>
              <th>Средний рейтинг</th>
              <th>Отзывы</th>
            </tr>
          </thead>
          <tbody>
            {doctorsPerformance.map((doc) => (
              <tr key={doc.id}>
                <td>{doc.firstName} {doc.lastName}</td>
                <td>{doc.Specialty?.name || '-'}</td>
                <td>{doc.totalAppointments}</td>
                <td>{parseFloat(doc.avgRating).toFixed(2)}</td>
                <td>{doc.reviewsCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Популярные специальности</h2>
        <table className="analytics-table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Врачей</th>
              <th>Записей</th>
            </tr>
          </thead>
          <tbody>
            {popularSpecialties.map((spec) => (
              <tr key={spec.id}>
                <td>{spec.name}</td>
                <td>{spec.doctorsCount}</td>
                <td>{spec.appointmentsCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default AdminStatistics;
