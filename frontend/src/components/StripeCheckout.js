// filepath: src/components/StripeCheckout.js
import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe("pk_test_HvEeju8Kg8pqDFSjQQyyxGDb"); // Remplacez par votre clé publique

const StripeCheckout = ({ cartTotal }) => {
    const token = localStorage.getItem('token');
    const handleCheckout = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/catalogue/api/create-stripe-session/', {
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
                alert('Erreur lors de la création de la session de paiement.');
            }
        } catch (error) {
            console.error('Erreur lors du paiement :', error);
        }
    };

    return (
        <div>
            <h3>Total : {cartTotal} €</h3>
            <button className="btn btn-primary" onClick={handleCheckout}>
                Payer avec Stripe
            </button>
        </div>
    );
};

export default StripeCheckout;