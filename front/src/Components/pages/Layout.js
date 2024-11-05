import React, { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import fileService from '../services/fileService';
import Header from '../others/Header';
import { useNavigate } from 'react-router-dom';
import ValidationDropdown from '../others/dropdown-menu/ValidationDropdown';
import UserManagementDropdown from '../others/dropdown-menu/UserManagementDropDown';

// Composant pour le menu latéral
function SidebarMenu({ pdfCount }) {
  const { t } = useTranslation();
  
  const [user, setUser] = useState({})

  useEffect(()=>{
    var userLocal = localStorage.getItem('user')
    userLocal = JSON.parse(userLocal)
    setUser(userLocal)
    
  }, []);

  
  return (
    <aside className="min-w-64 h-full bg-slate-100 text-dark border-r border-gray-300">
      <div className='flex items-center justify-between p-6'>
        <div className='text-lg font-bold'>Menu</div>
      </div>
      
      <nav className="space-y-2 p-6">
        <ul className='flex flex-col gap-2'>
          {user.role === "admin" && (
            <li hidden>
              <NavLink to="/accueil" className='menu-item'>
                {t('accueil')}
              </NavLink>
            </li>
          )}

          {/* Collapsible Validation Menu */}
          <ValidationDropdown utilisateur={user} />

          {/* Other menu items */}
          {user.role === "admin" && ( <li>
            <NavLink to="/alldoc" className='menu-item'>
              {t('tous-les-doc')}
            </NavLink>
          </li>)}
          
          {/* Collapsible Validation Menu */}
          {user.role === "admin" && ( 
          <UserManagementDropdown /> )}
        </ul>
      </nav>
    </aside>
  );
}

function Layout() {
  const navigate = useNavigate(); 
  const { i18n } = useTranslation();
  const [pdfCount, setPdfCount] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    fileService.fetchFiles()
      .then(files => {
        setPdfCount(files.length);
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des fichiers:", error);
        setError("Erreur lors de la récupération des fichiers.");
      });
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/');
    }
  }, [navigate]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="layout__page">
      <Header changeLanguage={changeLanguage} />
      <div className="flex flex-grow">
        <SidebarMenu changeLanguage={changeLanguage} pdfCount={pdfCount} />
        <main className="flex-grow w-full overflow-auto p-6 bg-white">
          <React.Fragment>{error && <div className="text-red-600">{error}</div>}</React.Fragment> {/* Afficher l'erreur si elle existe */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
