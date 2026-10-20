'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck, User, Building2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Identifiants invalides');
      }

      const data = await res.json();
      localStorage.setItem('tunijobs_token', data.accessToken);
      localStorage.setItem('tunijobs_user', JSON.stringify(data.user));

      // Redirection selon le rôle
      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else if (data.user.role === 'RECRUITER') {
        router.push('/recruteur/pipeline');
      } else {
        router.push('/offres');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Tunisia2026!');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-blue-600 items-center justify-center text-white text-2xl shadow-md mx-auto">
            🇹🇳
          </div>
          <h1 className="text-2xl font-black text-slate-900">Connexion à TuniJobs</h1>
          <p className="text-xs text-slate-500">
            Accédez à vos candidatures, offres d'emploi ou tableau de bord
          </p>
        </div>

        {/* ACCÈS RAPIDE COMPTES DE DÉMO */}
        <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-100 space-y-2">
          <span className="text-[11px] font-bold text-blue-900 block text-center uppercase tracking-wider">
            Connexion en 1 clic (Comptes Démo)
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickFill('candidat@tunijobs.tn')}
              className="py-1.5 px-2 bg-white rounded-lg border border-blue-200 text-[11px] font-semibold text-slate-700 hover:bg-blue-600 hover:text-white transition shadow-sm flex flex-col items-center"
            >
              <User className="w-3.5 h-3.5 mb-0.5 text-blue-600" />
              Candidat
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('rh@vermeg.com')}
              className="py-1.5 px-2 bg-white rounded-lg border border-blue-200 text-[11px] font-semibold text-slate-700 hover:bg-blue-600 hover:text-white transition shadow-sm flex flex-col items-center"
            >
              <Building2 className="w-3.5 h-3.5 mb-0.5 text-amber-600" />
              Recruteur
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@tunijobs.tn')}
              className="py-1.5 px-2 bg-white rounded-lg border border-blue-200 text-[11px] font-semibold text-slate-700 hover:bg-blue-600 hover:text-white transition shadow-sm flex flex-col items-center"
            >
              <ShieldCheck className="w-3.5 h-3.5 mb-0.5 text-purple-600" />
              Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Adresse Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@exemple.tn"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mot de passe</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t">
          Pas encore de compte ?{' '}
          <Link href="/inscription" className="font-bold text-blue-600 hover:underline">
            Créer un compte candidat ou recruteur
          </Link>
        </div>
      </div>
    </div>
  );
}
