import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./login.css"
import LanguageSwitcher from './../others/LanguageSwitcher'
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import fileService from "../services/fileService";
import { Refresh } from "@mui/icons-material";

export default function Login() {

  const {t, i18n } = useTranslation();
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailIncorrect, setEmailIncorrect] = useState(false)
  const [isLoading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate(); 

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  
  // Utilisation de useEffect pour rediriger si l'utilisateur est déjà connecté
  useEffect(() => {
    const token = localStorage.getItem('token');    
    if (token) {
      navigate('/prevalidation', {replace: true}); // Redirection vers la page d'accueil si connecté
    }
  }, [navigate]);

  // Récupérer email et mot de passe depuis localStorage lors du montage
  useEffect(() => {
    const savedEmail = localStorage.getItem('email');
    const savedPassword = localStorage.getItem('password');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';

    if (savedEmail && savedPassword && savedRememberMe) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(savedRememberMe);
    }
  }, []);

  // Fonction pour vérifier l'email dans le localStorage à la saisie
  const handleEmailChange = (e) => {
    const inputEmail = e.target.value;
    setEmail(inputEmail);
    
    const savedEmail = localStorage.getItem('email');
    if (inputEmail === savedEmail) {
      const savedPassword = localStorage.getItem('password');
      const savedRememberMe = localStorage.getItem('rememberMe') === 'true';

      if (savedPassword && savedRememberMe) {
        setPassword(savedPassword);
        setRememberMe(savedRememberMe);
      }
    }else{
      setPassword("");
      setRememberMe(false);

    }
  };
  if (localStorage.getItem('token')) {
    return null; // Ou un composant de chargement
  }
  
  async function handleSubmit(event) {
    event.preventDefault(); // Empêche la soumission par défaut du formulaire
    setLoading(true);
    try {
      const response = await axios.post(`${fileService.API_BASE_URL}/login`, {
        email,
        password,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data));
  
        // Assurez-vous que le token est bien sauvegardé avant de rediriger
        navigate("/prevalidation");
      } else {
        setEmailIncorrect(true)
        console.log("Erreur : aucun token trouvé.");
      }

      // Vérifie si 'se souvenir de moi' est coché
      if (rememberMe) {
        // Sauvegarde email et mot de passe dans localStorage
        localStorage.setItem('email', email);
        localStorage.setItem('password', password);
        localStorage.setItem('rememberMe', rememberMe);
      } else {
        // Sinon, supprime les valeurs de localStorage
        localStorage.removeItem('email');
        localStorage.removeItem('password');
        localStorage.removeItem('rememberMe');
      }
    } catch (error) {
      console.log("Erreur lors de la connexion:", error);
    } finally {
      setLoading(false);
    }
  }

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
                  {t('se-connecter')}
                </p>
                <div className="px-2 py-1 ml-auto">
                  <LanguageSwitcher changeLanguage={changeLanguage} />
                </div>
              </div>


              <form onSubmit={handleSubmit}>
                {/* <!-- Email input --> */}
                <div className="relative z-0 w-full mb-6 group">
                  <input type="email" name="email" id="email" 
                  className="block py-2.5 px-2 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-cyan-400 peer" 
                  placeholder=" " 
                  value={email}
                  onChange={handleEmailChange}/>
                  <label htmlFor="email" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3  origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">{t('email')}</label>
                </div>
                {/* <!--Password input--> */}
                <div className="relative z-0 w-full mb-6 group">
                  <input type="password" name="password" id="password" 
                  className="block py-2.5 px-2 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-cyan-400 peer" 
                  placeholder=" " 
                  value={password}
                  onChange={e=>setPassword(e.target.value)}/>
                  <label htmlFor="password" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-2  origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">{t('mot-de-passe')}</label>
                </div>


                <div className="mb-6 flex items-center justify-between">
                  {/* <!-- Remember me checkbox --> */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={rememberMe} 
                      onChange={(e) => setRememberMe(e.target.checked)} 
                      className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary px-2"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      {t('remember_me')}
                    </label>
                  </div>

                  {/* <!--Forgot password link--> */}
                  <a href="/forgotPassword" className="text-sm text-primary hover:underline">
                    {t('mdp-oublier')}
                  </a>
                </div>
                <div className={`text-center text-sm text-red-600 ${emailIncorrect ? '' : 'hidden'}`}>{t('Email_incorrect')}</div>
                <div className="text-center lg:text-left">

                  <button
                    type="submit"
                    className="inline-block w-full bouton-login text-white px-7 py-3 rounded shadow-md  transition duration-150 ease-in-out"
                    disabled={isLoading}
                  >
                  { isLoading && <Refresh className="animate-spin mr-2" /> }
                    {t('connexion')}
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