import React, { useEffect, useState } from 'react';
import { formatDateTime } from '../services/cartService';
import { loadStripe } from '@stripe/stripe-js';


const stripePromise = loadStripe('pk_test_HvEeju8Kg8pqDFSjQQyyxGDb'); //clé pblique de test Stripe

const Cart = () => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);

  // Fonction pour récupérer le panier
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const userId = JSON.parse(localStorage.getItem('user'))?.id;

        if (!token || !userId) {
          console.error('Utilisateur non connecté.');
          setCart({ items: [] });
          return;
        }

        const response = await fetch(`https://reservationsdjango-groupe-production.up.railway.app/accounts/api/user-cart/${userId}/`, {
          method: 'GET',
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        if (response.ok) {
          const fetchedCart = await response.json();
          setCart(fetchedCart);
        } else {
          console.error('Erreur lors de la récupération du panier.');
          setCart({ items: [] });
        }
      } catch (error) {
        console.error('Erreur réseau :', error);
        setCart({ items: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  // Fonction pour supprimer un article du panier
  const handleRemoveFromCart = async (cartItemId) => {
    try {
      const token = localStorage.getItem('token');
      const userId = JSON.parse(localStorage.getItem('user'))?.id;

      const response = await fetch(`https://reservationsdjango-groupe-production.up.railway.app/accounts/api/user-cart/delete/${userId}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cart_item_id: cartItemId }),
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
      } else {
        console.error('Erreur lors de la suppression de l\'article.');
      }
    } catch (error) {
      console.error('Erreur réseau :', error);
    }
  };

  // Fonction pour mettre à jour la quantité d'un article
  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Mise à jour de la quantité pour cart_item_id :', cartItemId, 'Nouvelle quantité :', newQuantity); // Ajout du console.log


      const response = await fetch(`https://reservationsdjango-groupe-production.up.railway.app/accounts/api/user-cart/update/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cart_item_id: cartItemId, quantity: newQuantity }),
      });


      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
      } else {
        console.error('Erreur lors de la mise à jour de la quantité.');
      }
    } catch (error) {
      console.error('Erreur réseau :', error);
    }
  };

  // Fonction pour gérer le paiement avec Stripe
  const handleCheckout = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://reservationsdjango-groupe-production.up.railway.app/catalogue/api/create-stripe-session/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
      });

      const data = await response.json();
      if (data.id) {
        const stripe = await stripePromise;
        stripe.redirectToCheckout({ sessionId: data.id });
      } else {
        console.error('Erreur lors de la création de la session de paiement.');
      }
    } catch (error) {
      console.error('Erreur lors du paiement :', error);
    }
  };

  if (loading) return <p>Chargement du panier...</p>;

  return (
    <div>
      <h1>Votre panier</h1>
      {cart.items && cart.items.length === 0 ? (
        <p>Votre panier est vide.</p>
      ) : (
        <ul className="list-group">
          {cart.items.map((item) => (
            <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <h5>{item.title}</h5>
                <p>Date : {formatDateTime(item.schedule)}</p>
                <p>Lieu : {item.location}</p>
                <h6>Prix :</h6>
                <p>
                  {item.price.type} : {parseFloat(item.price.amount).toFixed(2)}€
                </p>
                <h6>Quantité :</h6>
                <div className="d-flex align-items-center">
                  <button
                    className="btn btn-sm btn-secondary me-2"
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    className="btn btn-sm btn-primary ms-2"
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => handleRemoveFromCart(item.id)}
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      )}
      {cart.items && cart.items.length > 0 && (
        <div className="mt-4">
          <h4>
            Total :{' '}
            {cart.items
              .reduce(
                (total, item) => total + item.quantity * parseFloat(item.price.amount),
                0
              )
              .toFixed(2)}
            €
          </h4>
          <button className="btn btn-success mt-3" onClick={handleCheckout}>
            Payer avec Stripe
          </button>
        </div>
      )}
    </div>
  );
};


export default Cart;