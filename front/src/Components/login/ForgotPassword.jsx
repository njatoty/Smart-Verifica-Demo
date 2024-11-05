import React, { useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';
import LanguageSwitcher from "../others/LanguageSwitcher";
import fileService from "../services/fileService";

export default function ForgotPassword() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Envoie une requête au backend pour envoyer l'email de réinitialisation
      const response = await axios.post(fileService.API_BASE_URL+"/forgot-password", {
        email,
      });

      if (response.data.success) {
        setMessage(t("email_sent_reset_link"));  // Message de succès
        setTimeout(() => {
          navigate("/"); // Redirection vers la page de connexion après succès
        }, 3000);
      } else {
        setError(t("email_not_found"));  // Si l'email n'est pas trouvé
      }
    } catch (error) {
      setError(t("error_sending_email"));  // En cas d'erreur de requête
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="h-screen">
      <div className="h-full max-w-7xl mx-auto">
        {/* <!-- Left column container with background--> */}
        <div className="g-6 flex h-full flex-wrap items-center justify-center lg:justify-between">
          <div className="mb-12 grow-0 basis-auto md:w-9/12 lg:w-6/12">
            <img src="/smartverifica.png" alt="logo" className="w-full" />
          </div>

          {/* <!-- Right column container --> */}
          <div className="mb-12 md:w-8/12 lg:w-5/12">

            <div className="flex-grow flex gap-4 justify-end">
              <div className="flex flex-col items-end gap-3">
                <div className="our__logo font-bold">
                  <img src="/optimum-solutions-blacktext.png" alt="logo" className="w-32" />
                </div>
                {/* Menus */}
                <div className="flex items-center gap-6">
                </div>
              </div>
            </div>
            <>
              {/* <!--Sign in section--> */}
              <div className="flex flex-row items-center justify-center lg:justify-start mb-4">
                <p className="text-2xl font-bold text-gray-800 lg:text-left dark:text-gray-200">
                  {t('se-reinitialiser-mot-de-pass')}
                </p>
                <div className="px-2 py-1 ml-auto">
                  <LanguageSwitcher changeLanguage={changeLanguage} />
                </div>
              </div>
                <form onSubmit={handleSubmit}>
                <div className="relative z-0 w-full mb-6 group">
                    <input type="email" name="email" id="email" 
                    className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-400 peer" 
                    placeholder=" " 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required/>
                    <label htmlFor="email" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3  origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">{t('email')}</label>
                </div>
                
                {message && <div className="text-green-500 mb-4">{message}</div>}
                {error && <div className="text-red-500 mb-4">{error}</div>}

                <div className="flex items-center justify-between">
                    <button
                    type="submit"
                    className="inline-block w-full bouton-login text-white px-7 py-3 rounded shadow-md  transition duration-150 ease-in-out disabled:cursor-not-allowed"
                    disabled={loading}
                    >
                    {loading ? t('loading') : t('reset_password')}
                    </button>
                </div>
                </form>
            </>
           </div>
      </div>
    </div>
    </section>
  );
}
