import React, { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import fileService from '../services/fileService';
import Header from '../others/Header';
import { useNavigate } from 'react-router-dom';
import ValidationDropdown from '../others/dropdown-menu/ValidationDropdown';
import UserManagementDropdown from '../others/dropdown-menu/UserManagementDropDown';
import { useAuth } from '../../firebase/AuthContext';
import useUser from '../../hooks/useLocalStorage';

// Composant pour le menu latéral
function SidebarMenu({ pdfCount }) {
  const { t } = useTranslation();
  
  // const { currentUser, userLoggedIn } = useAuth();
  const { user: currentUser} = useUser();

  return (
    <aside className="min-w-64 h-full bg-slate-100 text-dark border-r border-gray-300">
      <div className='flex items-center justify-between p-6'>
        <div className='text-lg font-bold'>Menu</div>
      </div>
      
      <nav className="space-y-2 p-6">
        <ul className='flex flex-col gap-2'>
          {currentUser?.role === "admin" && (
            <li hidden>
              <NavLink to="/accueil" className='menu-item'>
                {t('accueil')}
              </NavLink>
            </li>
          )}

          {/* Collapsible Validation Menu */}
          <ValidationDropdown user={currentUser} />

          {/* Other menu items */}
          {currentUser?.role === "admin" && ( <li>
            <NavLink to="/alldoc" className='menu-item'>
              {t('tous-les-doc')}
            </NavLink>
          </li>)}
          
          {/* Collapsible Validation Menu */}
          {currentUser?.role === "admin" && ( 
          <UserManagementDropdown /> )}
          
          {/* Other menu items */}
          {currentUser?.role === "admin" && ( <li>
            <NavLink to="/data-source" className='menu-item'>
              {t('data-source-menu')}
            </NavLink>
          </li>)}
        </ul>
      </nav>
    </aside>
  );
}

function Layout() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="layout__page">
      <Header changeLanguage={changeLanguage} />
      <div className="flex flex-grow">
        <SidebarMenu changeLanguage={changeLanguage} />
        <main className="flex-grow w-full overflow-auto p-6 bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
