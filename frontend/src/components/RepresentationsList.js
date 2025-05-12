import React, { useEffect, useState } from 'react';
import '../RepresentationsList.css'; // Importer le fichier CSS pour les animations
import { addToCart } from '../services/cartService'; // Importer le service pour ajouter au panier

// Fonction pour formater la date et l'heure
const formatDateTime = (isoString) => {
  const date = new Date(isoString);
  const formattedDate = date.toLocaleDateString('fr-FR'); // Format de date : JJ/MM/AAAA
  const formattedTime = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); // Format de l'heure : HH:mm
  return `${formattedDate} à ${formattedTime}`;
};

// Add a helper function to get the image URL based on the show ID
const getShowImageUrl = (showId) => {
  return `/images/${showId}.jpg`; // Assuming images are stored in the public/images/ folder
};

const RepresentationsList = () => {
  const [representations, setRepresentations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPast, setShowPast] = useState(false); // État pour le filtre "Passés"
  const [selectedRepresentation, setSelectedRepresentation] = useState(null); // Spectacle sélectionné pour le modal
  const [quantities, setQuantities] = useState({}); // État pour les quantités par catégorie

  // Fonction pour gérer l'incrémentation
  const incrementQuantity = (categoryId) => {
    setQuantities((prev) => ({
      ...prev,
      [categoryId]: (prev[categoryId] || 0) + 1,
    }));
  };

  // Fonction pour gérer la décrémentation
  const decrementQuantity = (categoryId) => {
    setQuantities((prev) => ({
      ...prev,
      [categoryId]: Math.max((prev[categoryId] || 0) - 1, 0), // Empêche les valeurs négatives
    }));
  };

  useEffect(() => {
    fetch('http://127.0.0.1:8000/catalogue/api/representations/')
      .then((response) => response.json())
      .then((data) => {
        setRepresentations(data);
        setLoading(false);
      })
      .catch((error) => console.error('Error fetching representations:', error));
  }, []);

  const today = new Date(); // Date actuelle

  const handleAddToCart = async (representationId) => {
    const token = localStorage.getItem('token');

    // Préparer les données de la représentation
    const representationDetails = {
      id: representationId,
      title: selectedRepresentation.show?.title || 'Titre indisponible',
      schedule: selectedRepresentation.schedule || 'Date inconnue',
      location: selectedRepresentation.location || 'Lieu inconnu',
      locality: selectedRepresentation.locality || 'Localité inconnue',
      quantities: Object.entries(quantities).map(([type, count]) => ({
        type,
        count,
        price: selectedRepresentation.show.prices.find((price) => price.type === type)?.price || 0,
      })),
    };

    // Vérifier que `quantities` contient au moins un élément
    if (representationDetails.quantities.length === 0) {
      alert('Veuillez sélectionner au moins une quantité.');
      return;
    }

    // Si l'utilisateur n'est pas connecté
    if (!token) {
      // Stocker les informations dans le localStorage
      localStorage.setItem('pendingCartItem', JSON.stringify(representationDetails));

      // Rediriger vers la page de connexion
      window.location.href = '/login';
      return;
    }

    // Si l'utilisateur est connecté, envoyer la requête pour ajouter au panier
    try {
      const response = await addToCart(representationId, representationDetails.quantities);
      alert(response.message);
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier :', error);
      alert('Impossible d\'ajouter au panier.');
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Filtrer les représentations
  const filteredRepresentations = representations.filter((representation) => {
    const eventDate = new Date(representation.schedule); // Convertir la date en objet Date

    // Afficher les événements passés si "Afficher les passés" est coché
    if (showPast) {
      return eventDate < today; // Afficher uniquement les événements passés
    }

    // Sinon, afficher uniquement les événements à venir
    return eventDate >= today;
  });

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Liste de Spectacle</h1>

      {/* Checkbox pour le filtre "Passés" */}
      <div className="form-check mb-4">
        <input
          className="form-check-input"
          type="checkbox"
          id="pastFilter"
          checked={showPast}
          onChange={() => setShowPast(!showPast)} // Inverser l'état du filtre
        />
        <label className="form-check-label" htmlFor="pastFilter">
          Afficher uniquement les événements passés
        </label>
      </div>

      <ul className="list-group">
        {filteredRepresentations.map((representation) => {
          const eventDate = new Date(representation.schedule); // Convertir la date en objet Date
          const isExpired = eventDate < today; // Vérifier si l'événement est expiré
          const isBookable = representation.show.bookable; // Vérifier si l'événement est réservable

          return (
            <li
              key={representation.id}
              className="list-group-item d-flex justify-content-between align-items-center"
              onClick={() => setSelectedRepresentation(representation)} // Ouvrir le modal avec les détails
              style={{
                cursor: 'pointer',
                border: '1px solid #ddd',
                borderRadius: '5px',
                marginBottom: '10px',
                padding: '15px',
                backgroundColor: isExpired
                  ? '#f8d7da' // Rouge pour expiré
                  : isBookable
                  ? '#d4edda' // Vert pour réservable
                  : '#fff3cd', // Jaune pour non réservable
              }}
            >
              <div>
                <h5 className="mb-1 text-dark">
                  {representation.show.title}{' '}
                  {isExpired ? (
                    <span className="badge bg-danger">Expiré</span>
                  ) : representation.show.bookable ? (
                    <span className="badge bg-success">Disponible</span>
                  ) : (
                    <span className="badge bg-warning">Non disponible</span>
                  )}
                </h5>
                <p className="mb-0 text-muted">Date: {formatDateTime(representation.schedule)}</p>
                <p className="mb-0 text-muted">Localisation: {representation.location}</p>
                <p className="mb-0 text-muted">Localité: {representation.locality}</p>
              </div>
              <i className="bi bi-chevron-right text-secondary"></i>
            </li>
          );
        })}
      </ul>

      {/* Modal pour afficher les détails */}
      {selectedRepresentation && (
        <div
          className="modal fade show d-block custom-modal-animation"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedRepresentation.show.title}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedRepresentation(null)} // Fermer le modal
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <img
                  src={getShowImageUrl(selectedRepresentation.show.id)}
                  alt={selectedRepresentation.show.title}
                  style={{ width: '450px', height: '300px', objectFit: 'contain', marginBottom: '15px' }}
                />
                <p><strong>Date :</strong> {formatDateTime(selectedRepresentation.schedule)}</p>
                <p><strong>Localisation :</strong> {selectedRepresentation.location}</p>
                <p><strong>Localité :</strong> {selectedRepresentation.locality}</p>
                <p><strong>Spectacle :</strong> {selectedRepresentation.show.title}</p>
                <p><strong>Description :</strong> {selectedRepresentation.show.description}</p>
                <p><strong>Durée :</strong> {selectedRepresentation.show.duration} minutes</p>
                <p>
                  <strong>Artistes :</strong>{' '}
                  {selectedRepresentation.show.artists.length > 0
                    ? selectedRepresentation.show.artists.map(artist => `${artist.firstname} ${artist.lastname}`).join(', ')
                    : 'Aucun artiste disponible'}
                </p>

                {selectedRepresentation.show.bookable ? (
                  <>
                    <h5>Prix disponibles :</h5>
                    {selectedRepresentation.show.prices.map((price, index) => (
                      <div key={index} className="mb-3">
                        <label>
                          {price.type} ({price.price}€) :
                        </label>
                        <div className="d-flex align-items-center">
                          <button
                            type="button"
                            className="btn btn-secondary me-2"
                            onClick={() => decrementQuantity(price.type)}
                          >
                            -
                          </button>
                          <span>{quantities[price.type] || 0}</span>
                          <button
                            type="button"
                            className="btn btn-secondary ms-2"
                            onClick={() => incrementQuantity(price.type)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-primary mt-3"
                      onClick={() => handleAddToCart(selectedRepresentation.id)}
                      style={{
                        backgroundColor: '#007bff',
                        color: '#fff',
                        borderRadius: '5px',
                        padding: '8px 16px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        transition: 'transform 0.2s',
                        width: '130px',
                        height: '45px',
                      }}
                      onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
                      onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
                    >
                      Ajouter au panier
                    </button>
                  </>
                ) : (
                  <button type="button" className="btn btn-secondary" disabled>
                    Non réservable
                  </button>
                )}

                <button
                  type="button"
                  className="btn btn-secondary mt-3"
                  onClick={() => setSelectedRepresentation(null)}
                  style={{
                    borderRadius: '5px',
                    padding: '8px 16px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    width: '130px',
                    height: '45px',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepresentationsList;