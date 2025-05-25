import React, { useEffect, useState } from 'react';
import './AdminDoctors.css';

function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const [newDoctor, setNewDoctor] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    experience: '',
    education: '',
    specialtyId: '',  // теперь здесь id, а не имя
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
      fetchDoctors();
      fetchSpecialties();
    }
  }, [token]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/doctors', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setDoctors(data);
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/specialties', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSpecialties(data);
      setError('');
    } catch (e) {
      setError('Ошибка загрузки специальностей: ' + e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить врача?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/doctors/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      fetchDoctors();
      if (editingDoctorId === id) setEditingDoctorId(null);
    } catch (e) {
      alert('Ошибка при удалении: ' + e.message);
    }
  };

  const startEditing = (doctor) => {
    setEditingDoctorId(doctor.id);
    setEditForm({
      firstName: doctor.firstName || '',
      lastName: doctor.lastName || '',
      email: doctor.email || '',
      phone: doctor.phone || '',
      experience: doctor.experience?.toString() || '',
      education: doctor.education || '',
      specialtyId: doctor.specialtyId || '',  // id, а не имя
    });
  };

  const cancelEditing = () => {
    setEditingDoctorId(null);
    setEditForm({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async (id) => {
    try {
      if (!editForm.specialtyId || isNaN(editForm.specialtyId)) {
        alert('Выберите корректную специальность');
        return;
      }

      const payload = {
        ...editForm,
        experience: Number(editForm.experience),
        specialtyId: Number(editForm.specialtyId),
      };

      const res = await fetch(`http://localhost:5000/api/admin/doctors/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());
      fetchDoctors();
      cancelEditing();
    } catch (e) {
      alert('Ошибка при сохранении: ' + e.message);
    }
  };

  const handleNewDoctorChange = (e) => {
    const { name, value } = e.target;
    setNewDoctor((prev) => ({ ...prev, [name]: value }));
  };

  const addDoctor = async (e) => {
    e.preventDefault();

    if (!newDoctor.specialtyId || isNaN(newDoctor.specialtyId)) {
      alert('Выберите корректную специальность');
      return;
    }

    try {
      const payload = {
        ...newDoctor,
        experience: Number(newDoctor.experience),
        specialtyId: Number(newDoctor.specialtyId),
      };

      const res = await fetch('http://localhost:5000/api/admin/doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      setNewDoctor({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        experience: '',
        education: '',
        specialtyId: '',
      });
      fetchDoctors();
    } catch (e) {
      alert('Ошибка при добавлении: ' + e.message);
    }
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p style={{ color: 'red' }}>Ошибка: {error}</p>;

  return (
    <div className="admin-doctors-container">
      <h1>Список врачей</h1>
      <table className="admin-doctors-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Имя</th>
            <th>Фамилия</th>
            <th>Email</th>
            <th>Телефон</th>
            <th>Опыт</th>
            <th>Образование</th>
            <th>Специальность</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((doc) => (
            <tr key={doc.id}>
              <td>{doc.id}</td>
              <td>
                {editingDoctorId === doc.id ? (
                  <input
                    name="firstName"
                    value={editForm.firstName}
                    onChange={handleEditChange}
                  />
                ) : (
                  doc.firstName
                )}
              </td>
              <td>
                {editingDoctorId === doc.id ? (
                  <input
                    name="lastName"
                    value={editForm.lastName}
                    onChange={handleEditChange}
                  />
                ) : (
                  doc.lastName
                )}
              </td>
              <td>
                {editingDoctorId === doc.id ? (
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                  />
                ) : (
                  doc.email
                )}
              </td>
              <td>
                {editingDoctorId === doc.id ? (
                  <input
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditChange}
                  />
                ) : (
                  doc.phone
                )}
              </td>
              <td>
                {editingDoctorId === doc.id ? (
                  <input
                    type="number"
                    min="0"
                    name="experience"
                    value={editForm.experience}
                    onChange={handleEditChange}
                  />
                ) : (
                  doc.experience + ' лет'
                )}
              </td>
              <td>
                {editingDoctorId === doc.id ? (
                  <input
                    name="education"
                    value={editForm.education}
                    onChange={handleEditChange}
                  />
                ) : (
                  doc.education
                )}
              </td>
              <td>
                {editingDoctorId === doc.id ? (
                  <select
                    name="specialtyId"
                    value={editForm.specialtyId}
                    onChange={handleEditChange}
                  >
                    <option value="">Выберите специальность</option>
                    {specialties.map((spec) => (
                      <option key={spec.id} value={spec.id}>
                        {spec.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  doc.Specialty?.name || ''
                )}
              </td>
              <td>
                {editingDoctorId === doc.id ? (
                  <div className="action-buttons">
                    <button className="save-button" onClick={() => saveEdit(doc.id)}>Сохранить</button>
                    <button className="cancel-button" onClick={cancelEditing}>Отмена</button>
                  </div>
                ) : (
                  <div className="action-buttons">
                    <button onClick={() => startEditing(doc)}>Редактировать</button>
                    <button className="delete-button" onClick={() => handleDelete(doc.id)}>Удалить</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Добавить врача</h2>
      <form onSubmit={addDoctor} className="doctor-form">
        <input
          name="firstName"
          placeholder="Имя"
          value={newDoctor.firstName}
          onChange={handleNewDoctorChange}
          required
        />
        <input
          name="lastName"
          placeholder="Фамилия"
          value={newDoctor.lastName}
          onChange={handleNewDoctorChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={newDoctor.email}
          onChange={handleNewDoctorChange}
          required
        />
        <input
          name="phone"
          placeholder="Телефон"
          value={newDoctor.phone}
          onChange={handleNewDoctorChange}
          required
        />
        <input
          type="number"
          min="0"
          name="experience"
          placeholder="Опыт (лет)"
          value={newDoctor.experience}
          onChange={handleNewDoctorChange}
          required
        />
        <input
          name="education"
          placeholder="Образование"
          value={newDoctor.education}
          onChange={handleNewDoctorChange}
          required
        />
        <select
          name="specialtyId"
          value={newDoctor.specialtyId}
          onChange={handleNewDoctorChange}
          required
        >
          <option value="">Выберите специальность</option>
          {specialties.map((spec) => (
            <option key={spec.id} value={spec.id}>
              {spec.name}
            </option>
          ))}
        </select>

        <div className="action-buttons">
          <button type="submit" className="save-button">Добавить</button>
          <button
            type="button"
            className="cancel-button"
            onClick={() =>
              setNewDoctor({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                experience: '',
                education: '',
                specialtyId: '',
              })
            }
          >
            Очистить
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminDoctors;
