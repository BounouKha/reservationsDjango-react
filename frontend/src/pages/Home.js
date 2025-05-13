import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>🎭 Bienvenu aux réservations de Spectacles</h1>
        <p>Découvrez nos excellents spectacles et nos artistes talentueux!</p>
      </header>
      <div className="home-content">
        <div className="home-card">
          <h2>Nos Artistes</h2>
          <p>Explorez les profiles de nos talentueux artistes.</p>
          <Link to="/artists" className="btn btn-primary">Voir les artistes</Link>
        </div>
        <div className="home-card">
          <h2>Nos shows</h2>
          <p>Trouvez et reservez vos tickets pour les prochains shows.</p>
          <Link to="/representations" className="btn btn-primary">Voir les shows</Link>
        </div>
        <div className="home-card">
          <h2>Votre Panier</h2>
          <p>Vérifiez votre panier et completez votre reservation.</p>
          <Link to="/cart" className="btn btn-primary">Aller au panier</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
