import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Search, Upload, Shield, LogOut, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-50 shadow-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-wide block leading-tight text-white">Institutional Research</span>
              <span className="text-xs text-indigo-400 font-medium tracking-wider uppercase">Repository Hub</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6 text-sm font-medium">
            <Link to="/search" className="flex items-center gap-1.5 text-slate-300 hover:text-indigo-400 transition">
              <Search className="w-4 h-4" /> Browse & Search
            </Link>

            {user?.role === 'student' && (
              <Link to="/student" className="flex items-center gap-1.5 text-slate-300 hover:text-indigo-400 transition">
                <Upload className="w-4 h-4" /> Student Dashboard
              </Link>
            )}

            {user?.role === 'faculty' || user?.role === 'researcher' ? (
              <Link to="/faculty" className="flex items-center gap-1.5 text-slate-300 hover:text-indigo-400 transition">
                <Upload className="w-4 h-4" /> Faculty Portal
              </Link>
            ) : null}

            {user?.role === 'admin' && (
              <Link to="/admin" className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition">
                <Shield className="w-4 h-4" /> Admin Console
              </Link>
            )}

            {/* Auth section */}
            <div className="flex items-center gap-4 border-l border-slate-700 pl-4 ml-2">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">{user.name}</div>
                    <div className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold">{user.role}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-lg transition-all shadow-sm"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-200 hover:text-white transition"
                  >
                    <LogIn className="w-4 h-4" /> Log In
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition shadow-lg shadow-indigo-500/20"
                  >
                    <UserPlus className="w-4 h-4" /> Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
