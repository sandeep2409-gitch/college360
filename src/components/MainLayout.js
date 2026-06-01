'use client';
import Sidebar from './Sidebar';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import NotificationBell from './NotificationBell';

const MainLayout = ({ children }) => {
  const { user } = useAuth();
  const pathname = usePathname();

  const noSidebarPages = ['/login', '/register'];
  const showSidebar = !noSidebarPages.includes(pathname);

  if (!showSidebar) {
    return <div className="app-container">{children}</div>;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content" style={{ position: 'relative' }}>
        <div className="notification-wrapper" style={{
          position: 'absolute',
          top: '20px',
          right: '5%',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <NotificationBell />
        </div>
        <div className="animate-slide-up" style={{ paddingTop: '20px' }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
