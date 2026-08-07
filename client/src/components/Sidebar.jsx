import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const { isAuthenticated, user, logout, loginWithRedirect, isLoading } = useAuth0();

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-900 flex flex-col justify-between h-screen sticky top-0 hidden md:flex shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-900">
        <NavLink to="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-black bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent group-hover:scale-102 transition duration-200">
            Socratic AI
          </span>
        </NavLink>
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition duration-200 ${
              isActive
                ? 'bg-slate-900 text-white border border-slate-800'
                : 'text-slate-450 hover:bg-slate-900/40 hover:text-slate-200'
            }`
          }
        >
          <svg className="h-5 w-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </NavLink>

        {!isLoading && !isAuthenticated && (
          <>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition duration-200 ${
                  isActive
                    ? 'bg-slate-900 text-white border border-slate-800'
                    : 'text-slate-450 hover:bg-slate-900/40 hover:text-slate-200'
                }`
              }
            >
              <svg className="h-5 w-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In
            </NavLink>
            <NavLink
              to="/signup"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition duration-200 ${
                  isActive
                    ? 'bg-slate-900 text-white border border-slate-800'
                    : 'text-slate-450 hover:bg-slate-900/40 hover:text-slate-200'
                }`
              }
            >
              <svg className="h-5 w-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Register
            </NavLink>
          </>
        )}
      </div>

      {/* User Session Info / Profile */}
      <div className="p-4 border-t border-slate-900">
        {isLoading ? (
          <div className="h-14 w-full flex items-center justify-center">
            <div className="h-5 w-5 border-2 border-slate-800 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : isAuthenticated ? (
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {user?.picture && (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="h-10 w-10 rounded-full border border-violet-500/20 object-cover"
                />
              )}
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {user?.name || user?.nickname || 'Learner'}
                </p>
                <p className="text-xs text-slate-450 truncate">
                  {user?.email || 'Logged In'}
                </p>
              </div>
            </div>
            <button
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              className="w-full py-2.5 bg-slate-800 hover:bg-red-950/20 text-slate-400 hover:text-red-400 border border-slate-750 hover:border-red-500/25 text-xs font-bold uppercase tracking-wider rounded-xl transition duration-150 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => loginWithRedirect()}
            className="w-full py-3 bg-gradient-to-r from-violet-650 to-indigo-650 hover:from-violet-550 hover:to-indigo-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-violet-500/15 transition duration-200 cursor-pointer"
          >
            Get Started
          </button>
        )}
      </div>
    </aside>
  );
}
