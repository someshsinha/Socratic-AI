import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link, NavLink } from 'react-router-dom';
import logoImg from '../assets/logo.png';

export default function Navbar() {
  const { isAuthenticated, loginWithRedirect, logout, user, isLoading } = useAuth0();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Courses', to: '/my-courses' },
    { label: 'About', to: '/about' },
    { label: 'Docs', to: '/docs' },
  ];

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b"
      style={{ background: 'rgba(251,250,246,0.92)', backdropFilter: 'blur(14px)', borderColor: '#d8d3c7' }}
    >
      <div className="max-w-[1160px] mx-auto px-5 flex items-center justify-between gap-6 py-2">
        {/* Logo — h-20 = 80px, shows bust + name + tagline */}
        <Link to="/" className="flex-shrink-0">
          <img src={logoImg} alt="Socratic AI" className="h-20 w-auto object-contain" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5">
          {navLinks.map(link => (
            <NavLink
              key={link.label}
              to={link.to}
              className={({ isActive }) =>
                `px-3 py-1.5 text-sm font-medium border transition-all ${
                  isActive
                    ? 'border-[#111827] bg-white text-[#111827]'
                    : 'border-transparent text-[#5f6673] hover:border-[#d8d3c7] hover:bg-white/70 hover:text-[#111827]'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-gray-700 animate-spin" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-3">
              {user?.picture && (
                <img src={user.picture} alt={user.name} className="h-8 w-8 border border-[#d8d3c7]" />
              )}
              <span className="hidden sm:inline text-sm" style={{ color: '#5f6673' }}>{user?.name || user?.nickname}</span>
              <button
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                className="px-3 py-1.5 border text-xs font-bold hover:-translate-y-px transition-transform"
                style={{ borderColor: '#111827', color: '#111827' }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => loginWithRedirect()}
              className="px-4 py-2 border text-sm font-bold text-white hover:-translate-y-px transition-transform"
              style={{ borderColor: '#111827', background: '#111827' }}
            >
              Start Learning →
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-1.5 border"
            style={{ borderColor: '#d8d3c7' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-4 h-4" style={{ color: '#111827' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {mobileMenuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t px-5 py-3 space-y-1" style={{ background: '#fbfaf6', borderColor: '#d8d3c7' }}>
          {navLinks.map(link => (
            <NavLink
              key={link.label}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 text-sm border ${
                  isActive ? 'font-semibold' : ''
                }`
              }
              style={({ isActive }) => ({
                borderColor: isActive ? '#111827' : 'transparent',
                background: isActive ? 'white' : 'transparent',
                color: isActive ? '#111827' : '#5f6673',
              })}
            >
              {link.label}
            </NavLink>
          ))}
          {!isAuthenticated && (
            <button
              onClick={() => loginWithRedirect()}
              className="w-full mt-2 px-3 py-2 border text-sm font-bold text-white text-left"
              style={{ borderColor: '#111827', background: '#111827' }}
            >
              Start Learning →
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
