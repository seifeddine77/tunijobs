import React from 'react';
import Link from 'next/link';
import { Briefcase, MapPin, Sparkles, Building2, User } from 'lucide-react';

export function Navbar() {
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
            IA CV
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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </Link>
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
        </div>
      </div>
    </header>
  );
}
