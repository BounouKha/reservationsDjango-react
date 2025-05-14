import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import UserMetaList from './components/UserMetaList';
import ArtistList from './components/ArtistList';
import RepresentationsList from './components/RepresentationsList';
import ShowDetail from './components/ShowDetail';
import Cart from './components/Cart';
import Login from './auth/Login';
import Profile from './auth/Profile';
import { isUserLoggedIn } from './auth/authService';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css'; // Importer les styles personnalisés
import Success from './pages/Success';
import Cancel from './pages/Cancel';
import ArtistDetail from './components/ArtistDetail';
import Home from './pages/Home';
import ShowReviews from './pages/ShowReviews';

function App() {
    const [hasItemsInCart, setHasItemsInCart] = useState(false);
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const fetchUserAndCartStatus = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const userId = user?.id;

            if (!token || !userId) {
                setHasItemsInCart(false);
                setUser(null);
                return;
            }

            const loggedIn = await isUserLoggedIn(userId);

            if (loggedIn) {
                const localCart = JSON.parse(localStorage.getItem('cart')) || { items: [] };
                setHasItemsInCart(localCart.items.length > 0);
            } else {
                setUser(null);
                setHasItemsInCart(false);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des données utilisateur ou du panier :', error);
            setHasItemsInCart(false);
            setUser(null);
        }
    }, [user]);

    useEffect(() => {
        fetchUserAndCartStatus();
    }, [fetchUserAndCartStatus]);

    const handleLogout = () => {
        setUser(null);
        setHasItemsInCart(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <Router>
            <div className="container-fluid">
                <header className="row app-header py-3">
                    <div className="col-12 text-center">
                        <h1 className="app-title">🎭 Réservations Spectacles</h1>
                    </div>
                    <nav className="col-12 d-flex justify-content-between align-items-center">
                        <ul className="nav nav-pills">
                            <li className="nav-item">
                                <Link to="/" className="nav-link">Home</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/artists" className="nav-link">Nos Artistes</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/representations" className="nav-link">Nos Spectacles</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/shows/reviews" className="nav-link">Avis</Link>
                            </li>
                        </ul>
                        <div className="nav-actions">
                            {user ? (
                                <>
                                    <Link to="/profile" className="btn btn-outline-dark me-3">
                                        <i className="bi bi-person-circle"></i> Profil
                                    </Link>
                                    <button
                                        className="btn btn-danger logout-btn"
                                        onClick={handleLogout}
                                    >
                                        <i className="bi bi-box-arrow-right me-2"></i> Déconnexion
                                    </button>
                                </>
                            ) : (
                                <Link to="/login" className="btn btn-outline-dark">Connexion</Link>
                            )}
                            {!user && (
                                <Link to="/register" className="btn btn-outline-success me-3">
                                    S'inscrire
                                </Link>
                            )}
                            <Link to={user ? "/cart" : "/login"} className="btn btn-outline-dark position-relative ms-3">
                                <i className="bi bi-cart"></i>
                                {hasItemsInCart && user && (
                                    <span className="cart-badge">
                                        <span className="visually-hidden">Articles dans le panier</span>
                                    </span>
                                )}
                            </Link>
                        </div>
                    </nav>
                </header>
                <main className="row app-main py-4">
                    <div className="col-12">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/user-meta" element={<UserMetaList />} />
                            <Route path="/artists" element={<ArtistList />} />
                            <Route path="/representations" element={<RepresentationsList />} />
                            <Route path="/show/:id" element={<ShowDetail />} />
                            <Route path="/cart" element={user ? <Cart /> : <Navigate to="/login" />} />
                            <Route path="/login" element={user ? <Navigate to="/profile" /> : <Login onLoginSuccess={setUser} />} />
                            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/artists/:id" element={<ArtistDetail />} />
                            <Route path="/shows/reviews" element={<ShowReviews />} />
                            <Route path="/shows/:showId/reviews" element={<ShowReviews />} />

                            {/* Autres routes */}
                            <Route path="/success" element={<Success />} />
                            <Route path="/cancel" element={<Cancel />} />
                        </Routes>
                    </div>
                </main>
                <footer className="row app-footer py-3">
                    <div className="col-12 text-center">
                        <p>© 2025 Réservations Spectacles. Tous droits réservés.</p>
                    </div>
                </footer>
            </div>
        </Router>
    );
}

export default App;