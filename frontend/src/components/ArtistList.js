import React, { useEffect, useState } from 'react';
import '../ArtistList.css';
import { FaSearch, FaUser } from 'react-icons/fa';

const ArtistList = () => {
  const [allArtists, setAllArtists] = useState([]);
  const [filteredArtists, setFilteredArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAllArtists = () => {
    fetch('http://127.0.0.1:8000/catalogue/api/artists/?all=true')
      .then((response) => response.json())
      .then((data) => {
        setAllArtists(data);
        setFilteredArtists(data);
      })
      .catch((error) => console.error('Error fetching all artists:', error));
  };

  const fetchArtists = (page = 1) => {
    setLoading(true);
    fetch(`http://127.0.0.1:8000/catalogue/api/artists/?page=${page}`)
      .then((response) => response.json())
      .then((data) => {
        setFilteredArtists(data.results);
        setNextPage(data.next);
        setPreviousPage(data.previous);
        setCurrentPage(page);
        setLoading(false);
      })
      .catch((error) => console.error('Error fetching artists:', error));
  };

  useEffect(() => {
    fetchAllArtists();
    fetchArtists();
  }, []);

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = allArtists.filter((artist) =>
      artist.firstname.toLowerCase().includes(value) ||
      artist.lastname.toLowerCase().includes(value)
    );
    setFilteredArtists(filtered);
  };

  if (loading) {
    return <div className="spinner-border text-primary" role="status"><span className="sr-only">Loading...</span></div>;
  }

  return (
    <div className="artist-list-container">
      <h1 className="mb-4"><FaUser /> Nos artistes</h1>
      <div className="search-bar-container mb-4">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search artists..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-bar"
        />
      </div>
      <div className="artist-cards">
        {filteredArtists.map((artist) => (
          <div key={artist.id} className="card artist-card">
            <div className="card-body">
              <h5 className="card-title">{artist.firstname} {artist.lastname}</h5>
              <p className="card-text">More details about the artist can go here.</p>
            </div>
          </div>
        ))}
      </div>
      <div className="pagination mt-4">
        <button
          onClick={() => fetchArtists(currentPage - 1)}
          disabled={!previousPage}
          className="btn btn-primary me-2"
        >
          Previous
        </button>
        <span>Page {currentPage}</span>
        <button
          onClick={() => fetchArtists(currentPage + 1)}
          disabled={!nextPage}
          className="btn btn-primary ms-2"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ArtistList;