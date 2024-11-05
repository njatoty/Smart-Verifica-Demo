import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import fileService from "../services/fileService";

export default function ResetPassword() {
  const { token } = useParams(); // Récupère le token depuis l'URL
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Fonction pour gérer la soumission du formulaire de réinitialisation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Vérifie si les mots de passe sont identiques
    if (newPassword !== confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      // Envoie de la demande de réinitialisation au backend
      const response = await axios.post(fileService.API_BASE_URL+`/reset-password/${token}`, {
        password: newPassword,
      });
      
      if (response.data.success) {
        setSuccessMessage("Mot de passe réinitialisé avec succès !");
        // Rediriger vers la page de connexion après un court délai
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else {
        setErrorMessage("Erreur lors de la réinitialisation du mot de passe.");
      }
    } catch (error) {
      setErrorMessage("Le lien est invalide ou a expiré.");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Réinitialiser votre mot de passe</h1>
        
        {errorMessage && (
          <div className="text-red-500 mb-4">{errorMessage}</div>
        )}
        
        {successMessage && (
          <div className="text-green-500 mb-4">{successMessage}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
            <input 
              type="password" 
              id="newPassword" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded-md w-full"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
            <input 
              type="password" 
              id="confirmPassword" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded-md w-full"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600"
          >
            Réinitialiser le mot de passe
          </button>
        </form>
      </div>
    </div>
  );
}
