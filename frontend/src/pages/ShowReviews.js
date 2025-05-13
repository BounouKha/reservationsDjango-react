import React, { useEffect, useState } from 'react';
import './ShowReviews.css';

const ShowReviews = () => {
  const [shows, setShows] = useState([]); // State for all shows with reviews
  const [loading, setLoading] = useState(true);
  const [selectedShow, setSelectedShow] = useState(null); // State for the selected show
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [newReview, setNewReview] = useState(''); // State for the new review text
  const [newStars, setNewStars] = useState(0); // State for the new review stars

  const isAuthenticated = !!localStorage.getItem('token'); // Check if the user is authenticated

  useEffect(() => {
    fetch('https://reservationsdjango-groupe-production.up.railway.app/catalogue/api/shows/reviews/')
      .then((response) => response.json())
      .then((data) => {
        setShows(data);
        setLoading(false);
      })
      .catch((error) => console.error('Error fetching shows with reviews:', error));
  }, []);

  const handleShowClick = (show) => {
    setSelectedShow(show);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedShow(null);
  };

   const handleAddReview = () => {
  if (!newReview || newStars <= 0) {
    alert('Veuillez remplir tous les champs avant de soumettre votre avis.');
    return;
  }

  if (newStars < 1 || newStars > 5) {
    alert('Le nombre d\'étoiles doit être compris entre 1 et 5.');
    return;
  }

  setLoading(true); // Add a loading state

  fetch(`https://reservationsdjango-groupe-production.up.railway.app/catalogue/api/shows/${selectedShow.show.id}/reviews/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({
      review: newReview,
      stars: newStars,
    }),
  })
    .then((response) => {
      setLoading(false); // Reset loading state
      return response.json().then((data) => {
        if (response.ok) {
          alert('Votre avis a été ajouté avec succès !');
          setNewReview('');
          setNewStars(0);
          handleCloseModal();
        } else {
          alert('Une erreur est survenue lors de l\'ajout de votre avis.');
        }
      });
    })
    .catch((error) => {
      setLoading(false); // Reset loading state
      console.error('Error adding review:', error);
    });
};


  const filteredShows = shows.filter((show) =>
    show.show.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Spectacles et Avis</h1>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Rechercher un spectacle..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      {loading ? (
        <div className="text-center mt-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <ul className="list-group">
          {filteredShows.map((show) => {
            const averageStars =
              show.reviews.length > 0
                ? (
                    show.reviews.reduce((sum, review) => sum + review.stars, 0) /
                    show.reviews.length
                  ).toFixed(1)
                : 'N/A';

            return (
              <li
                key={show.show.id}
                className="list-group-item d-flex justify-content-between align-items-center"
                onClick={() => handleShowClick(show)}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  {show.show.title}
                  <span className="ms-2 text-muted">({averageStars} ★)</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Modal for reviews */}
      {showModal && selectedShow && (
        <div className="custom-modal">
          <div className="custom-modal-content">
            <span className="custom-modal-close" onClick={handleCloseModal}>&times;</span>
            <h2>{selectedShow.show.title}</h2>
            <h5>Avis :</h5>
            {selectedShow.reviews.length === 0 ? (
              <p>Aucun avis disponible pour ce spectacle.</p>
            ) : (
              <ul className="list-group">
                {selectedShow.reviews.map((review) => (
                  <li key={review.id} className="list-group-item d-flex align-items-center">
                    <div className="me-3" style={{ fontWeight: 'bold', fontSize: '1.2em' }}>
                      {review.stars} ★
                    </div>
                    <div>
                      <strong>{review.user.username}</strong>: {review.review}
                    </div>
                  </li>
                ))}
              </ul>
            )}
             {isAuthenticated && (
              <>
                <h5 className="mt-4">Ajouter un avis :</h5>
                <textarea
                  className="form-control mb-2"
                  placeholder="Écrivez votre avis ici..."
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                ></textarea>
                <input
                  type="number"
                  className="form-control mb-2"
                  placeholder="Nombre d'étoiles (1-5)"
                  value={newStars}
                  onChange={(e) => setNewStars(Number(e.target.value))}
                  min="1"
                  max="5"
                />
                <button className="btn btn-primary" onClick={handleAddReview}>
                  Soumettre
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowReviews;
