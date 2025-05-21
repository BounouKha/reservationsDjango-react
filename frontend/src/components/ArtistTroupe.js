import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ArtistTroupe = () => {
  const { artistId } = useParams();
  const [troupe, setTroupe] = useState(null);
  const [error, setError] = useState(null);
  const [troupeList, setTroupeList] = useState([]);
  const [selectedTroupe, setSelectedTroupe] = useState('');

  useEffect(() => {
    const fetchTroupe = async () => {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      if (!token || !user || !user.is_staff) {
        setError('Vous devez être un utilisateur staff pour accéder à cette ressource.');
        return;
      }

      try {
        const response = await fetch(`https://reservationsdjango-groupe-production.up.railway.app/catalogue/artist/${artistId}/troupe/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTroupe(data.troupe ? data.troupe.name : 'Non affilié');
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Erreur lors de la récupération de la troupe.');
        }
      } catch (err) {
        setError('Erreur réseau. Veuillez réessayer.');
      }
    };

    const fetchTroupeList = async () => {
      try {
        const response = await fetch('https://reservationsdjango-groupe-production.up.railway.app/catalogue/api/troupes/');
        if (response.ok) {
          const data = await response.json();
          setTroupeList(data);
        } else {
          console.error('Erreur lors de la récupération de la liste des troupes.');
        }
      } catch (err) {
        console.error('Erreur réseau lors de la récupération des troupes.', err);
      }
    };

    fetchTroupe();
    fetchTroupeList();
  }, [artistId]);

  const handleTroupeAssignment = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`https://reservationsdjango-groupe-production.up.railway.app/catalogue/artist/${artistId}/troupe/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ troupe_id: selectedTroupe }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Troupe assigned successfully:', data);
        setTroupe(data.troupe ? data.troupe.name : 'Non affilié');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors de l\'assignation de la troupe.');
      }
    } catch (err) {
      setError('Erreur réseau lors de l\'assignation de la troupe.');
    }
  };

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="container mt-5">
      <h1>Troupe de l'artiste</h1>
      {troupe ? (
        <p><strong>Troupe :</strong> {troupe}</p>
      ) : (
        <p>Chargement...</p>
      )}
      <form onSubmit={handleTroupeAssignment}>
        <div className="form-group">
          <label htmlFor="troupeSelect">Assigner une troupe :</label>
          <select
            id="troupeSelect"
            className="form-control"
            value={selectedTroupe}
            onChange={(e) => setSelectedTroupe(e.target.value)}
          >
            <option value="">Sélectionnez une troupe</option>
            {troupeList.map((troupeItem) => (
              <option key={troupeItem.id} value={troupeItem.id}>
                {troupeItem.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary mt-3">
          Assigner la troupe
        </button>
      </form>
    </div>
  );
};

export default ArtistTroupe;
