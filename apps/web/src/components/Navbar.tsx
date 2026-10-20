'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  MapPin,
  Sparkles,
  Building2,
  User,
  LogOut,
  Bell,
  ShieldCheck,
  FileText,
} from 'lucide-react';

export function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = () => {
      try {
        const stored = localStorage.getItem('tunijobs_user');
        if (stored) {
          setUser(JSON.parse(stored));
        } else {
          setUser(null);
        }
      } catch (e) {
        setUser(null);
      }
    };

    checkUser();
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('tunijobs_token');
    localStorage.removeItem('tunijobs_user');
    setUser(null);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow">
            🇹🇳
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900">
            Tuni<span className="text-blue-600">Jobs</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-700">
          <Link href="/offres" className="flex items-center hover:text-blue-600 transition">
            <Briefcase className="w-4 h-4 mr-1.5 text-blue-600" />
            Trouver un emploi
          </Link>
          <Link href="/carte" className="flex items-center hover:text-blue-600 transition">
            <MapPin className="w-4 h-4 mr-1.5 text-rose-500" />
            Carte Tunisie
          </Link>
          <Link href="/ia-cv" className="flex items-center hover:text-blue-600 transition">
            <Sparkles className="w-4 h-4 mr-1.5 text-amber-500" />
            IA CV & OCR
          </Link>
          <Link href="/recruteur/pipeline" className="flex items-center hover:text-blue-600 transition">
            <Building2 className="w-4 h-4 mr-1.5 text-slate-500" />
            Recruteur
          </Link>
          <Link href="/admin" className="flex items-center hover:text-blue-600 transition">
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 border text-slate-600 font-semibold hover:bg-slate-200">
              Admin
            </span>
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          <Link
            href="/notifications"
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-full transition relative"
            title="Notifications"
          >
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
            <Bell className="w-4 h-4" />
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              {user.role === 'CANDIDATE' && (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href="/candidat/candidatures"
                    className="text-xs font-semibold text-slate-700 hover:text-blue-600 px-2 py-1"
                  >
                    Candidatures
                  </Link>
                  <Link
                    href="/candidat/profil"
                    className="text-xs font-semibold text-slate-700 hover:text-blue-600 px-2 py-1 flex items-center gap-1"
                  >
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    Profil
                  </Link>
                </div>
              )}
              {user.role === 'RECRUITER' && (
                <Link
                  href="/recruteur/offres/nouvelle"
                  className="hidden sm:inline-flex text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200 hover:bg-blue-100"
                >
                  + Offre
                </Link>
              )}
              <span className="text-[11px] font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-600">
                {user.email?.split('@')[0]}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/connexion"
                className="text-sm font-semibold text-slate-700 hover:text-blue-600 px-3 py-2 rounded-md transition"
              >
                Connexion
              </Link>
              <Link
                href="/inscription"
                className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow transition flex items-center"
              >
                <User className="w-4 h-4 mr-1.5" />
                Créer un compte
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
