import React, { useEffect, useState } from 'react';
import './ShowReviews.css';

const ShowReviews = () => {
  const [shows, setShows] = useState([]); // State for all shows with reviews
  const [loading, setLoading] = useState(true);
  const [selectedShow, setSelectedShow] = useState(null); // State for the selected show
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [searchQuery, setSearchQuery] = useState(''); // State for search query

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
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowReviews;
