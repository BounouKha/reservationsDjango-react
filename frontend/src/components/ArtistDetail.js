import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ArtistDetail = () => {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtistDetails = async () => {
      try {
        const response = await fetch(`https://reservationsdjango-groupe-production.up.railway.app/catalogue/api/artists/${id}/detail/`);
        if (response.ok) {
          const data = await response.json();
          setArtist(data);
        } else {
          console.error('Failed to fetch artist details');
        }
      } catch (error) {
        console.error('Error fetching artist details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistDetails();
  }, [id]);

  if (loading) return <p>Loading artist details...</p>;

  if (!artist) return <p>Artist not found.</p>;

  return (
    <div className="artist-detail-container">
      <h1>{artist.firstname} {artist.lastname}</h1>
      <h2>Types:</h2>
      <ul>
        {artist.types.map((type, index) => (
          <li key={index}>{type.type}</li>
        ))}
      </ul>
      <h2>Shows:</h2>
      <ul>
        {artist.shows.map((show) => (
          <li key={show.id}>
            <h3>{show.title}</h3>
            <p>{show.description}</p>
            <p>Duration: {show.duration} minutes</p>
            <p>{show.bookable ? 'Bookable' : 'Not Bookable'}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ArtistDetail;
