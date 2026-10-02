import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { LandingPage } from './landing/LandingPage';
import { api } from './lib/api';
import './index.css';

/**
 * Tiny path router:
 *   /          public landing page
 *   /login     sign-in   (the app shows it when nobody is logged in)
 *   /signup    sign-up
 *   /app       the ProfitBloom app itself
 */
function Root() {
  const [path, setPath] = useState(window.location.pathname);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (path === '/') api.me().then(({ user }) => setLoggedIn(!!user)).catch(() => setLoggedIn(false));
  }, [path]);

  const go = (to: string) => {
    if (to === window.location.pathname) return;
    window.history.pushState(null, '', to);
    setPath(to);
    window.scrollTo(0, 0);
  };

  if (path === '/') return <LandingPage isLoggedIn={loggedIn} onNavigate={go} />;
  return <App authMode={path === '/signup' ? 'register' : 'login'} go={go} />;
}

createRoot(document.getElementById('root')!).render(<Root />);
