const BASE_URL = 'https://reservationsdjango-groupe-production.up.railway.app/catalogue'; // Remplacez par l'URL de votre API

export const isUserLoggedIn = async () => {
  try {
    const token = localStorage.getItem('token'); // Récupérer le token depuis localStorage
    const userId = JSON.parse(localStorage.getItem('user'))?.id; // Récupérer l'ID utilisateur depuis localStorage

    if (!token || !userId) {
      console.error('Aucun token ou ID utilisateur trouvé.');
      return false;
    }

    const response = await fetch(`${BASE_URL}/api/user-meta/${userId}/`, {
      method: 'GET',
      headers: {
        Authorization: `Token ${token}`, // Ajouter le token dans l'en-tête
      },
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.is_logged_in; // Vérifiez si l'utilisateur est connecté via is_logged_in
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'authentification :', error);
    return false;
  }
};