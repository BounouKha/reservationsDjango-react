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
        const clearCartAndProcessPayment = async () => {
            if (isProcessing) {
                console.log('Une requête est déjà en cours. Annulation de l\'appel.');
                return;
            }

            setIsProcessing(true); // Marquer comme en cours de traitement

            try {
                const token = localStorage.getItem('token');
                const userId = JSON.parse(localStorage.getItem('user'))?.id;

                
                if (!token || !userId) {
                    console.error('Utilisateur non connecté.');
                    setIsProcessing(false); // Réinitialiser l'état
                    return;
                }

                // Étape 0 : Récupérer les prix depuis l'API
                const prices = await fetchPrices();
                if (!prices) {
                    console.error('Impossible de récupérer les prix.');
                    setIsProcessing(false); // Réinitialiser l'état
                    return;
                }

                // Créer un mapping dynamique entre les types de prix et leurs IDs
                const priceTypeToId = prices.reduce((acc, price) => {
                    acc[price.type] = price.id;
                    return acc;
                }, {});
                console.log('Mapping des types de prix vers leurs IDs :', priceTypeToId);

                // Étape 1 : Récupérer les données du panier
                console.log('Récupération des données du panier...');
                const cartResponse = await fetch(`https://reservationsdjango-groupe-production.up.railway.app/accounts/api/user-cart/${userId}/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                });

                if (!cartResponse.ok) {
                    console.error('Erreur lors de la récupération du panier.');
                    setIsProcessing(false); // Réinitialiser l'état
                    return;
                }

                const cartData = await cartResponse.json();
                console.log('Données du panier récupérées :', cartData);

                if (!cartData.items || cartData.items.length === 0) {
                    console.error('Le panier est vide ou les données sont invalides.');
                    setIsProcessing(false); // Réinitialiser l'état
                    return;
                }

                // Étape 2 : Récupérer les IDs des spectacles et des prix
                const quantities = await Promise.all(
                    cartData.items.map(async (item) => {
                        const representationId = await fetchRepresentationIdByTitle(
                            item.title, // Titre du spectacle
                            item.schedule, // Date et heure de la représentation
                            item.location // Localisation de la représentation
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
                // Filtrer les données invalides
                const validQuantities = quantities.filter((q) => q !== null);
                console.log('Données de paiement générées :', validQuantities);

                if (validQuantities.length === 0) {
                    console.error('Aucune donnée valide pour le paiement.');
                    setIsProcessing(false); // Réinitialiser l'état
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

                if (clearCartResponse.ok) {
                    console.log('Panier vidé avec succès.');
                } else {
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

                if (paymentResponse.ok) {
                    const data = await paymentResponse.json();
                    console.log('Paiement traité avec succès :', data);
                } else {
                    console.error('Erreur lors du traitement du paiement.');
                }
            } catch (error) {
                console.error('Erreur réseau :', error);
            } finally {
                setIsProcessing(false); // Réinitialiser l'état après traitement
            }
        };

        clearCartAndProcessPayment();
    }, [isProcessing]); // Ajoutez `isProcessing` comme dépendance pour éviter les appels multiples

    return (
        <div className="container mt-5">
            <h1>Paiement réussi !</h1>
            <p>Merci pour votre achat. Votre réservation a été confirmée.</p>
        </div>
    );
};

export default Success;