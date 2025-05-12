import React from "react";
import { addToCart } from "../services/cartService";

const ShowDetail = ({ representation }) => {
  const handleAddToCart = async () => {
    try {
      // Utilise representation.id pour ajouter au panier
      const response = await addToCart(representation.id, 1);
      alert(response.message); // Affiche un message basé sur la réponse
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'ajout au panier.");
    }
  };

  return (
    <div>
      <h1>{representation.show.title}</h1>
      <p>{representation.show.description}</p>
      <button onClick={handleAddToCart}>Ajouter au panier</button>
    </div>
  );
};

export default ShowDetail;