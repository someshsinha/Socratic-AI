import React, { useState, useRef, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import siteConfig from '../config/siteConfig';

export default function Navbar() {
  const { isAuthenticated, loginWithRedirect, logout, user, isLoading } = useAuth0();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCoursesClick = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate('/my-courses');
    } else {
      loginWithRedirect({ appState: { returnTo: '/my-courses' } });
    }
  };

  const handleStartLearningClick = () => {
    if (isAuthenticated) {
      navigate('/my-courses');
    } else {
      loginWithRedirect({ appState: { returnTo: '/my-courses' } });
    }
  };

  // Format display name from user object or email
  const getDisplayName = () => {
    if (user?.given_name && user?.family_name) {
      return `${user.given_name} ${user.family_name}`;
    }
    if (user?.name && !user.name.includes('@')) {
      return user.name;
    }
    if (user?.nickname && !user.nickname.includes('@')) {
      // capitalize nickname parts
      const clean = user.nickname.replace(/[0-9]/g, '');
      if (clean.toLowerCase().includes('somesh')) {
        return 'Somesh Sinha';
      }
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    }
    if (user?.email) {
      const prefix = user.email.split('@')[0].replace(/[0-9]/g, '');
      if (prefix.toLowerCase().includes('somesh')) {
        return 'Somesh Sinha';
      }
      return prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }
    return 'Somesh Sinha';
  };

  // Get user initials for avatar
  const getInitials = () => {
    const name = getDisplayName();
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const displayName = getDisplayName();
  const initials = getInitials();
  const displayEmail = user?.email || siteConfig.creator.email;

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b print:hidden"
      style={{ background: 'rgba(251,250,246,0.94)', backdropFilter: 'blur(14px)', borderColor: '#d8d3c7' }}
    >
      <div className="max-w-[1240px] mx-auto px-6 flex items-center justify-between gap-6 py-2">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <img src={logoImg} alt="Socratic AI" className="h-20 w-auto object-contain" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5">
          <button
            onClick={handleCoursesClick}
            className="px-3 py-1.5 text-sm font-medium border border-transparent text-[#5f6673] hover:border-[#d8d3c7] hover:bg-white/70 hover:text-[#111827] transition-all cursor-pointer"
          >
            Courses
          </button>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `px-3 py-1.5 text-sm font-medium border transition-all ${
                isActive
                  ? 'border-[#111827] bg-white text-[#111827]'
                  : 'border-transparent text-[#5f6673] hover:border-[#d8d3c7] hover:bg-white/70 hover:text-[#111827]'
              }`
            }
          >
            About
          </NavLink>
        </div>

        {/* Auth action / Profile Dropdown */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-gray-700 animate-spin" />
          ) : isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              {/* Profile Avatar Pill Trigger */}
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 py-1 px-2 border border-[#d8d3c7] hover:border-[#111827] bg-white hover:bg-gray-50 transition-all cursor-pointer rounded-sm"
                style={{
                  boxShadow: profileDropdownOpen ? '0 2px 8px rgba(17,24,39,0.08)' : 'none',
                }}
                aria-expanded={profileDropdownOpen}
              >
                {user?.picture && !imgError ? (
                  <img
                    src={user.picture}
                    alt={displayName}
                    onError={() => setImgError(true)}
                    className="w-7 h-7 object-cover rounded-full border border-[#d8d3c7]"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#4f46e5] text-white text-[11px] font-bold flex items-center justify-center tracking-wider">
                    {initials}
                  </div>
                )}
                
                <span className="text-xs font-bold text-[#111827] tracking-wide">
                  {initials}
                </span>

                <svg
                  className={`w-3.5 h-3.5 text-gray-600 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-white border border-[#d8d3c7] z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  style={{
                    boxShadow: '0 16px 36px rgba(17,24,39,0.1)',
                  }}
                >
                  {/* User Info Header */}
                  <div className="p-4 flex items-center gap-3.5">
                    {user?.picture && !imgError ? (
                      <img
                        src={user.picture}
                        alt={displayName}
                        onError={() => setImgError(true)}
                        className="w-10 h-10 object-cover rounded-full border border-[#d8d3c7] shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#4f46e5] text-white font-bold flex items-center justify-center shrink-0 text-sm">
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-extrabold text-[#111827] truncate m-0">
                        {displayName}
                      </p>
                      <p className="text-xs text-[#5f6673] truncate m-0 mt-0.5 font-mono">
                        {displayEmail}
                      </p>
                    </div>
                  </div>

                  {/* Menu Options */}
                  <div className="border-t border-[#d8d3c7]">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        navigate('/my-courses');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-[#111827] hover:bg-[#fbfaf6] text-left transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4 text-indigo-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      My Course Library
                    </button>
                  </div>

                  <div className="border-t border-[#d8d3c7]">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout({ logoutParams: { returnTo: window.location.origin } });
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-650 hover:text-red-700 hover:bg-red-50/50 text-left transition-colors cursor-pointer"
                      style={{ color: '#991b1b' }}
                    >
                      <svg className="w-4 h-4 text-red-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleStartLearningClick}
              className="px-4 py-2 border text-sm font-bold text-white hover:-translate-y-px transition-transform cursor-pointer"
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
        <div className="md:hidden border-t px-6 py-3 space-y-1" style={{ background: '#fbfaf6', borderColor: '#d8d3c7' }}>
          <button
            onClick={(e) => { setMobileMenuOpen(false); handleCoursesClick(e); }}
            className="block w-full text-left px-3 py-2 text-sm border border-transparent text-[#5f6673] hover:text-[#111827]"
          >
            Courses
          </button>
          <NavLink
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `block px-3 py-2 text-sm border ${isActive ? 'font-semibold' : ''}`
            }
            style={({ isActive }) => ({
              borderColor: isActive ? '#111827' : 'transparent',
              background: isActive ? 'white' : 'transparent',
              color: isActive ? '#111827' : '#5f6673',
            })}
          >
            About
          </NavLink>

          {isAuthenticated ? (
            <div className="pt-2 border-t border-[#d8d3c7] space-y-1">
              <button
                onClick={() => { setMobileMenuOpen(false); navigate('/my-courses'); }}
                className="w-full px-3 py-2 border text-sm font-bold text-left cursor-pointer flex items-center gap-2"
                style={{ borderColor: '#d8d3c7', background: 'white', color: '#111827' }}
              >
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                My Course Library
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout({ logoutParams: { returnTo: window.location.origin } });
                }}
                className="w-full px-3 py-2 border text-sm font-bold text-left cursor-pointer flex items-center gap-2 text-red-700"
                style={{ borderColor: '#d8d3c7', background: 'white' }}
              >
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setMobileMenuOpen(false); handleStartLearningClick(); }}
              className="w-full mt-2 px-3 py-2 border text-sm font-bold text-white text-left cursor-pointer"
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
