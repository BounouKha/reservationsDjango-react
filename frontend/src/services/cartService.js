


const BASE_URL = "http://127.0.0.1:8000/catalogue/api"; //


// Fonction pour formater la date et l'heure
export const formatDateTime = (isoString) => {
  const date = new Date(isoString);
  const formattedDate = date.toLocaleDateString('fr-FR'); // Format de date : JJ/MM/AAAA
  const formattedTime = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); // Format de l'heure : HH:mm
  return `${formattedDate} à ${formattedTime}`;
};

export const getCart = async (userId) => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Utilisateur non connecté.');
  }

  try {
    const response = await fetch(`http://127.0.0.1:8000/accounts/api/user-cart/${userId}/`, {
      method: 'GET',
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Échec de la récupération du panier');
    }

    const cart = await response.json();
    console.log('Panier récupéré :', cart);
    return cart;
  } catch (error) {
    console.error('Erreur lors de la récupération du panier :', error);
    throw error;
  }
};

// Fonction pour ajouter une représentation au panier
export const addToCart = async (representationId, quantities) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token || !user) {
    throw new Error('Utilisateur non connecté.');
  }

  try {
    console.log('Tentative d\'ajout au panier :');
    console.log('ID de la représentation :', representationId);
    console.log('Quantités :', quantities);
    const response = await fetch(`http://127.0.0.1:8000/accounts/api/user-cart/${user.id}/`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: representationId, // ID de la représentation
        quantities: quantities, // Liste des quantités
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur du backend :', errorData);
      throw new Error('Échec de l\'ajout au panier');
    }

    const data = await response.json();
    console.log('Article ajouté au panier :', data);
    return data;
  } catch (error) {
    console.error('Erreur lors de l\'ajout au panier :', error);
    throw error;
  }
};

export const clearCart = async () => {
  const response = await fetch(BASE_URL, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to clear cart");
  }
  return response.json();
};

// Fonction pour synchroniser le panier local avec le serveur
export const syncLocalCartWithServer = async () => {
  const cart = JSON.parse(localStorage.getItem('cart')) || {};
  console.log('Synchronisation du panier local avec le serveur :', cart);

  const promises = Object.entries(cart).map(async ([representationId, quantity]) => {
    try {
      await addToCart(parseInt(representationId), quantity); // Ajouter chaque article au serveur
    } catch (error) {
      console.error(`Erreur lors de la synchronisation de l'article ${representationId} :`, error);
    }
  });

  await Promise.all(promises);
  localStorage.removeItem('cart'); // Nettoyer le stockage local après synchronisation
  console.log('Panier local synchronisé avec le serveur.');
};


export const updateCartItem = async (userId, cartItemId, quantity) => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Utilisateur non connecté.');
  }

  try {
    const response = await fetch(`http://127.0.0.1:8000/accounts/api/user-cart/${userId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ cart_item_id: cartItemId, quantity }),
    });

    if (!response.ok) {
      throw new Error('Échec de la mise à jour de l\'article');
    }

    const data = await response.json();
    console.log('Article mis à jour :', data);
    return data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'article :', error);
    throw error;
  }
};


export const removeFromCart = async (userId, cartItemId) => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Utilisateur non connecté.');
  }

  try {
    const response = await fetch(`http://127.0.0.1:8000/accounts/api/user-cart/${userId}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ cart_item_id: cartItemId }),
    });

    if (!response.ok) {
      throw new Error('Échec de la suppression de l\'article');
    }

    const data = await response.json();
    console.log('Article supprimé :', data);
    return data;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'article :', error);
    throw error;
  }
};