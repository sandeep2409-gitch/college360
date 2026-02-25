import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

const MainLayout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();


  const noSidebarPages = ['/login', '/register'];
  const showSidebar = !noSidebarPages.includes(location.pathname);

  if (!showSidebar) {
    return <div className="app-container">{children}</div>;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="animate-slide-up">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
