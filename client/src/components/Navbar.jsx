import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  const { isAuthenticated, loginWithRedirect, logout, user, isLoading } = useAuth0();

  return (
    <nav className="md:hidden sticky top-0 z-50 w-full backdrop-blur-md bg-slate-900/80 border-b border-slate-800/60 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-2xl font-black bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                Socratic AI
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition duration-200 ${
                  isActive
                    ? 'text-white bg-slate-800/60'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                }`
              }
            >
              Home
            </NavLink>
            {isAuthenticated && (
              <NavLink
                to="/my-courses"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition duration-200 ${
                    isActive
                      ? 'text-white bg-slate-800/60'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                  }`
                }
              >
                My Library
              </NavLink>
            )}
          </div>

          {/* Authentication controls */}
          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="h-8 w-8 rounded-full border-2 border-slate-700 border-t-violet-500 animate-spin" />
            ) : isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-block text-xs font-semibold text-slate-400 tracking-wide uppercase px-2 py-1 rounded bg-slate-800/40 border border-slate-800">
                  {user?.name || user?.nickname || 'Learner'}
                </span>
                {user?.picture && (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="h-9 w-9 rounded-full border border-violet-500/30 shadow-md object-cover"
                  />
                )}
                <button
                  onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-red-400 bg-slate-800 hover:bg-red-950/20 border border-slate-700/80 hover:border-red-500/30 rounded-xl transition duration-200 cursor-pointer"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => loginWithRedirect()}
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl shadow-lg hover:shadow-violet-500/25 active:scale-95 transition duration-200 cursor-pointer"
              >
                Log In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav indicator/links */}
      <div className="md:hidden border-t border-slate-800/30 py-2 px-4 flex justify-around bg-slate-950/20 text-xs">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `px-3 py-1.5 rounded-md font-medium transition duration-200 ${
              isActive ? 'text-white bg-slate-800/60' : 'text-slate-400 hover:text-white'
            }`
          }
        >
          Home
        </NavLink>
        {isAuthenticated && (
          <NavLink
            to="/my-courses"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-md font-medium transition duration-200 ${
                isActive ? 'text-white bg-slate-800/60' : 'text-slate-400 hover:text-white'
              }`
            }
          >
            My Library
          </NavLink>
        )}
      </div>
    </nav>
  );
}
