import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PasswordChangeForm = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const validationErrors = [];

    if (password.length < 8) {
      validationErrors.push('Le mot de passe doit contenir au moins 8 caractères.');
    }

    if (/^\d+$/.test(password)) {
      validationErrors.push('Le mot de passe ne peut pas être entièrement numérique.');
    }

    const commonPasswords = ['12345678', 'password', 'qwerty']; // Add more common passwords as needed
    if (commonPasswords.includes(password)) {
      validationErrors.push('Le mot de passe est trop commun.');
    }

    return validationErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const validationErrors = validatePassword(newPassword);
    if (validationErrors.length > 0) {
      setError(validationErrors.join(' '));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      console.error('Aucun token trouvé. Redirection vers la page de connexion.');
      navigate('/login');
      return;
    }

    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];

    try { 
      const response = await fetch('https://reservationsdjango-groupe-production.up.railway.app/accounts/api/change-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken, 
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await response.json();
        setError(data.detail || 'Une erreur est survenue.');
      }
    } catch (err) {
      console.error('Erreur réseau :', err);
      setError('Erreur réseau. Veuillez réessayer.');
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-lg p-4">
        <h2 className="text-center mb-4">Changer le mot de passe</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">Mot de passe changé avec succès.</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label className="form-label">Ancien mot de passe</label>
            <input
              type="password"
              className="form-control"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group mb-3">
            <label className="form-label">Nouveau mot de passe</label>
            <input
              type="password"
              className="form-control"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group mb-3">
            <label className="form-label">Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="d-grid">
            <button type="submit" className="btn btn-primary">Changer le mot de passe</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordChangeForm;
