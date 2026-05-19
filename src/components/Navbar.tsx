import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: 'Accueil' },
    { path: '/courses', label: 'Cours' },
    ...(isAuthenticated ? [{ path: '/dashboard', label: 'Tableau de bord' }] : []),
    ...(isAuthenticated ? [{ path: '/quizzes', label: 'Quiz' }] : []),
    ...(isAuthenticated ? [{ path: '/leaderboard', label: 'Classement' }] : []),
    ...(isAdmin ? [{ path: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-card/95 backdrop-blur-md border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src="https://github.com/valdexkvj/kvj-evolution-school/raw/main/kvj-logo.png"
              alt="KVJ-Evolution School Logo"
              className="w-10 h-10 object-cover rounded-full bg-dark-border p-0.5 shadow-md"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://raw.githubusercontent.com/valdexkvj/kvj-evolution-school/main/kvj-logo.png";
              }}
            />
            <span className="text-xl font-bold text-accent-orange">
              KVJ-Evolution School
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-accent-orange'
                    : 'text-dark-muted hover:text-dark-text'
                }`}
              >
                {link.label === 'Admin' ? (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Admin
                  </span>
                ) : (
                  link.label
                )}
              </Link>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <span className="px-2 py-0.5 text-xs font-bold text-white bg-accent-orange rounded-full">
                      ADMIN
                    </span>
                  )}
                  <span className="text-sm text-dark-muted">
                    {user?.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-dark-muted hover:text-dark-text transition-colors"
                >
                  Deconnexion
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-dark-muted hover:text-dark-text transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-accent-orange rounded-lg hover:bg-accent-orange-dark transition-all shadow-md shadow-accent-orange/20"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-dark-muted hover:bg-dark-border"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-dark-card border-b border-dark-border">
          <div className="px-4 py-3 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  location.pathname === link.path
                    ? 'text-accent-orange bg-accent-orange/10'
                    : 'text-dark-muted hover:bg-dark-border'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-dark-border" />
            {isAuthenticated ? (
              <button
                onClick={() => { handleLogout(); setMobileOpen(false); }}
                className="block w-full text-left px-3 py-2 text-sm font-medium text-accent-orange hover:bg-dark-border rounded-lg"
              >
                Deconnexion
              </button>
            ) : (
              <div className="space-y-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center px-3 py-2 text-sm font-medium text-dark-muted border border-dark-border rounded-lg hover:bg-dark-border"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center px-3 py-2 text-sm font-medium text-white bg-accent-orange rounded-lg"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
