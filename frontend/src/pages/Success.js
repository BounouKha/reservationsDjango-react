import React, { useEffect, useState } from 'react';

const fetchRepresentationIdByTitle = async (title, schedule, location) => {
    try {
        console.log('Titre recherché :', title);

        // Requête pour récupérer toutes les représentations associées au titre
        const response = await fetch(`https://reservationsdjango-groupe-production.up.railway.app/catalogue/api/representations/?title=${encodeURIComponent(title)}`);
        if (!response.ok) {
            console.error('Erreur lors de la récupération de l\'ID de la représentation.');
            return null;
        }

        const representations = await response.json();
        console.log('Représentations reçues de l\'API :', representations);

        // Filtrer les représentations pour trouver celle qui correspond aux critères
        const representation = representations.find((rep) => {
            return (
                rep.schedule === schedule && // Vérifie la date et l'heure
                rep.location === location // Vérifie la localisation
            );
        });

        if (representation) {
            console.log(`Représentation trouvée :`, representation);
            return representation.id; // Retourne l'ID de la représentation
        } else {
            console.log(`Aucune représentation trouvée pour le titre "${title}" avec les critères spécifiés.`);
            return null;
        }
    } catch (error) {
        console.error('Erreur réseau lors de la récupération de l\'ID de la représentation :', error);
        return null;
    }
};

const fetchPrices = async () => {
    try {
        const response = await fetch('https://reservationsdjango-groupe-production.up.railway.app/accounts/api/prices/');
        if (!response.ok) {
            console.error('Erreur lors de la récupération des prix.');
            return null;
        }
        const prices = await response.json();
        console.log('Prix récupérés depuis l\'API :', prices);
        return prices;
    } catch (error) {
        console.error('Erreur réseau lors de la récupération des prix :', error);
        return null;
    }
};

const Success = () => {
    const [isProcessing, setIsProcessing] = useState(false); // État pour éviter les requêtes multiples

    useEffect(() => {
        let isMounted = true; // To prevent state updates on unmounted components

        const clearCartAndProcessPayment = async () => {
            if (isMounted && !isProcessing) {
                setIsProcessing(true); // Mark as processing

                try {
                    const token = localStorage.getItem('token');
                    const userId = JSON.parse(localStorage.getItem('user'))?.id;

                    if (!token || !userId) {
                        console.error('Utilisateur non connecté.');
                        return;
                    }

                    // Étape 0 : Récupérer les prix depuis l'API
                    const prices = await fetchPrices();
                    if (!prices) {
                        console.error('Impossible de récupérer les prix.');
                        return;
                    }

                    // Créer un mapping dynamique entre les types de prix et leurs IDs
                    const priceTypeToId = prices.reduce((acc, price) => {
                        acc[price.type] = price.id;
                        return acc;
                    }, {});

                    // Étape 1 : Récupérer les données du panier
                    const cartResponse = await fetch(`https://reservationsdjango-groupe-production.up.railway.app/accounts/api/user-cart/${userId}/`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Token ${token}`,
                        },
                    });

                    if (!cartResponse.ok) {
                        console.error('Erreur lors de la récupération du panier.');
                        return;
                    }

                    const cartData = await cartResponse.json();

                    if (!cartData.items || cartData.items.length === 0) {
                        console.error('Le panier est vide ou les données sont invalides.');
                        return;
                    }

                    // Étape 2 : Récupérer les IDs des spectacles et des prix
                    const quantities = await Promise.all(
                        cartData.items.map(async (item) => {
                            const representationId = await fetchRepresentationIdByTitle(
                                item.title,
                                item.schedule,
                                item.location
                            );

                            if (!representationId) {
                                console.error(`Impossible de trouver l'ID de la représentation pour le titre : ${item.title}`);
                                return null;
                            }

                            const priceId = priceTypeToId[item.price?.type];
                            if (!priceId) {
                                console.error(`Type de prix invalide : ${item.price?.type}`);
                                return null;
                            }

                            return {
                                representation_id: representationId,
                                price_id: priceId,
                                quantity: item.quantity,
                            };
                        })
                    );

                    const validQuantities = quantities.filter((q) => q !== null);

                    if (validQuantities.length === 0) {
                        console.error('Aucune donnée valide pour le paiement.');
                        return;
                    }

                    // Étape 3 : Vider le panier
                    const clearCartResponse = await fetch('https://reservationsdjango-groupe-production.up.railway.app/accounts/api/clear-cart/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Token ${token}`,
                        },
                    });

                    if (!clearCartResponse.ok) {
                        console.error('Erreur lors de la suppression du panier.');
                    }

                    // Étape 4 : Envoyer les données du paiement
                    const paymentData = { quantities: validQuantities };

                    const paymentResponse = await fetch('https://reservationsdjango-groupe-production.up.railway.app/accounts/api/payment-success/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Token ${token}`,
                        },
                        body: JSON.stringify(paymentData),
                    });

                    if (!paymentResponse.ok) {
                        console.error('Erreur lors du traitement du paiement.');
                    }s
                } catch (error) {
                    console.error('Erreur réseau :', error);
                } finally {
                    if (isMounted) {
                        setIsProcessing(false); // Reset processing state
                    }
                }
            }
        };

        clearCartAndProcessPayment();

        return () => {
            isMounted = false; // Cleanup function to prevent state updates
        };
    }, [isProcessing]); // Include isProcessing in the dependency array

    return (
        <div className="container mt-5">
            <h1>Paiement réussi !</h1>
            <p>Merci pour votre achat. Votre réservation a été confirmée.</p>
        </div>
    );
};

export default Success;