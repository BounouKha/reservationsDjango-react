import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaTicketAlt, FaKey } from 'react-icons/fa';
import PasswordChangeForm from './PasswordChangeForm';

const generateReservationCSV = (reservation) => {
  const headers = ['Titre', 'Date', 'Quantité'];
  const rows = [
    [
      reservation.title,
      new Date(reservation.booking_date).toLocaleString(),
      `${reservation.quantity} places`,
    ],
  ];

  const csvContent = [headers, ...rows]
    .map((row) => row.map((item) => `"${item}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  return url;
};

const Profile = () => {
  const [user, setUser] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [language, setLanguage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileAndReservations = async () => {
      const token = localStorage.getItem('token');
      const userId = JSON.parse(localStorage.getItem('user'))?.id; // Reintroduce userId to fix no-undef errors

      if (!token) {
        console.error('Aucun token trouvé. Redirection vers la page de connexion.');
        navigate('/login');
        return;
      }

      try {
        const userResponse = await fetch(`https://reservationsdjango-groupe-production.up.railway.app/catalogue/api/user-meta/${userId}/`, {
          method: 'GET',
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData.user);
          setFirstName(userData.user.first_name);
          setLastName(userData.user.last_name);
          setLanguage(userData.user.language);
        } else {
          console.error('Erreur lors de la récupération des données utilisateur.');
          navigate('/login');
          return;
        }

        const reservationsResponse = await fetch(`https://reservationsdjango-groupe-production.up.railway.app/accounts/api/user-reservations/${userId}/`, {
          method: 'GET',
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        if (reservationsResponse.ok) {
          const reservationsData = await reservationsResponse.json();
          setReservations(reservationsData);
        } else {
          console.error('Erreur lors de la récupération des réservations.');
        }
      } catch (err) {
        console.error('Erreur réseau :', err);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    const intervalId = setInterval(fetchProfileAndReservations, 10000); // Retry every 15 seconds

    fetchProfileAndReservations(); // Initial fetch

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    const token = localStorage.getItem('token');
    // Removed userId declaration here since it is not used in this function

    try {
      const response = await fetch(`https://reservationsdjango-groupe-production.up.railway.app/accounts/api/user-detail/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          language,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser.user); // Ensure the updated user is set correctly
        alert('Profil mis à jour avec succès !');
        setIsEditing(false);
      } else {
        console.error('Erreur lors de la mise à jour du profil.');
        alert('Une erreur est survenue lors de la mise à jour du profil.');
      }
    } catch (error) {
      console.error('Erreur réseau :', error);
      alert('Une erreur réseau est survenue.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <div className="spinner-border text-primary" role="status"><span className="sr-only">Chargement...</span></div>;

  return (
    <div className="container mt-5">
      <div className="card mb-4">
        <div className="card-body">
          <h1 className="card-title"><FaUser /> Profil</h1>
          {user ? (
            <div>
              {isEditing ? (
                <form onSubmit={handleUpdateProfile}>
                  <div className="form-group">
                    <label htmlFor="firstName">Prénom</label>
                    <input
                      type="text"
                      id="firstName"
                      className="form-control"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isUpdating}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Nom</label>
                    <input
                      type="text"
                      id="lastName"
                      className="form-control"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={isUpdating}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={isUpdating}>
                    {isUpdating ? 'Mise à jour...' : 'Mettre à jour'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary ml-2"
                    onClick={() => setIsEditing(false)}
                    disabled={isUpdating}
                  >
                    Annuler
                  </button>
                </form>
              ) : (
                <div>
                  <h2>{user.first_name} {user.last_name}</h2>
                  <p><strong>Nom d'utilisateur :</strong> {user.username}</p>
                  <p><strong>Email :</strong> {user.email}</p>
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => setIsEditing(true)}
                  >
                    Modifier le profil
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p>Aucune information utilisateur disponible.</p>
          )}
        </div>
      </div>

      <h2 className="mt-4"><FaTicketAlt /> Vos Réservations</h2>
      {reservations.length > 0 ? (
        <>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Spectacle</th>
                <th>Quantité</th>
                <th>Date de réservation</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td>{reservation.title}</td>
                  <td>{reservation.quantity} places</td>
                  <td>{new Date(reservation.booking_date).toLocaleString()}</td>
                  <td>{reservation.status}</td>
                  <td>
                    <a
                      href={generateReservationCSV(reservation)}
                      download={`reservation_${reservation.id}.csv`}
                      className="btn btn-outline-primary btn-sm"
                    >
                      Télécharger CSV
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p>Vous n'avez aucune réservation.</p>
      )}

      <div className="mt-5">
        <div className="card">
          <div className="card-body">
            <h2 className="card-title"><FaKey /> Changer le mot de passe</h2>
            <PasswordChangeForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;