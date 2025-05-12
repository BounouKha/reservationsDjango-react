import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaTicketAlt, FaKey } from 'react-icons/fa';
import PasswordChangeForm from './PasswordChangeForm';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileAndReservations = async () => {
      const token = localStorage.getItem('token');
      const userId = JSON.parse(localStorage.getItem('user'))?.id;

      if (!token || !userId) {
        console.error('Aucun token ou ID utilisateur trouvé. Redirection vers la page de connexion.');
        navigate('/login');
        return;
      }

      try {
        const userResponse = await fetch(`http://127.0.0.1:8000/catalogue/api/user-meta/${userId}/`, {
          method: 'GET',
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData.user);
        } else {
          console.error('Erreur lors de la récupération des données utilisateur.');
          navigate('/login');
          return;
        }

        const reservationsResponse = await fetch(`http://127.0.0.1:8000/accounts/api/user-reservations/${userId}/`, {
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

  if (loading) return <div className="spinner-border text-primary" role="status"><span className="sr-only">Chargement...</span></div>;

  return (
    <div className="container mt-5">
      <div className="card mb-4">
        <div className="card-body">
          <h1 className="card-title"><FaUser /> Profil</h1>
          {user ? (
            <div>
              <h2>{user.first_name} {user.last_name}</h2>
              <p><strong>Nom d'utilisateur :</strong> {user.username}</p>
              <p><strong>Email :</strong> {user.email}</p>
              <p><strong>Langue :</strong> Français</p>
            </div>
          ) : (
            <p>Aucune information utilisateur disponible.</p>
          )}
        </div>
      </div>

      <h2 className="mt-4"><FaTicketAlt /> Vos Réservations</h2>
      {reservations.length > 0 ? (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Spectacle</th>
              <th>Quantité</th>
              <th>Date de réservation</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation.id}>
                <td>{reservation.title}</td>
                <td>{reservation.quantity} places</td>
                <td>{new Date(reservation.booking_date).toLocaleString()}</td>
                <td>{reservation.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
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