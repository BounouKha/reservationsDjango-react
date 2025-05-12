import React, { useState, useEffect } from 'react';
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

function App() {
    const [hasItemsInCart, setHasItemsInCart] = useState(false);
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const fetchUserAndCartStatus = async () => {
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
    };

    useEffect(() => {
        fetchUserAndCartStatus();
    }, []);

    const handleLogout = () => {
        setUser(null);
        setHasItemsInCart(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <Router>
            <div className="app-container">
                <header className="app-header">
                    <h1 className="app-title">🎭 Réservations Spectacles</h1>
                    <nav className="app-nav">
                        <ul className="nav-links">
                            <li>
                                <Link to="/user-meta" className="nav-link">User Meta</Link>
                            </li>
                            <li>
                                <Link to="/artists" className="nav-link">Nos Artistes</Link>
                            </li>
                            <li>
                                <Link to="/representations" className="nav-link">Nos Spectacles</Link>
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
                <main className="app-main">
                    <Routes>
                        <Route path="/user-meta" element={<UserMetaList />} />
                        <Route path="/artists" element={<ArtistList />} />
                        <Route path="/representations" element={<RepresentationsList />} />
                        <Route path="/show/:id" element={<ShowDetail />} />
                        <Route path="/cart" element={user ? <Cart /> : <Navigate to="/login" />} />
                        <Route path="/login" element={user ? <Navigate to="/profile" /> : <Login onLoginSuccess={setUser} />} />
                        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
                         
                         {/* Autres routes */}
                        <Route path="/success" element={<Success />} />
                        <Route path="/cancel" element={<Cancel />} />
                    </Routes>
                </main>
                <footer className="app-footer">
                    <p>© 2025 Réservations Spectacles. Tous droits réservés.</p>
                </footer>
            </div>
        </Router>
    );
}

export default App;