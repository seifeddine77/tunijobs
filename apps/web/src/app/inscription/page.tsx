'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, Building2, Phone, Briefcase, FileText, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<'CANDIDATE' | 'RECRUITER'>('CANDIDATE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Common fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('+216 ');

  // Candidate fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Recruiter fields
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: any = {
      email,
      password,
      role,
      phone: phone.trim(),
    };

    if (role === 'CANDIDATE') {
      payload.firstName = firstName.trim() || 'Candidat';
      payload.lastName = lastName.trim() || 'Tunisie';
    } else {
      payload.companyName = companyName.trim() || 'Entreprise Tunisie';
      // RNE Matricule fiscal format: 1234567A/A/M/000
      payload.taxId = taxId.trim() || `${Math.floor(1000000 + Math.random() * 9000000)}A/A/M/000`;
    }

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        const msg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        throw new Error(msg || 'Erreur lors de la création du compte');
      }

      const data = await res.json();
      localStorage.setItem('tunijobs_token', data.accessToken);
      localStorage.setItem('tunijobs_user', JSON.stringify(data.user));

      if (data.user.role === 'RECRUITER') {
        router.push('/recruteur/pipeline');
      } else {
        router.push('/offres');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-blue-600 items-center justify-center text-white text-2xl shadow-md mx-auto">
            🇹🇳
          </div>
          <h1 className="text-2xl font-black text-slate-900">Créer un compte TuniJobs</h1>
          <p className="text-xs text-slate-500">
            Rejoignez la première plateforme intelligente de l'emploi en Tunisie
          </p>
        </div>

        {/* SELECTEUR DU RÔLE */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setRole('CANDIDATE')}
            className={`py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
              role === 'CANDIDATE'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            Candidat
          </button>
          <button
            type="button"
            onClick={() => setRole('RECRUITER')}
            className={`py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
              role === 'RECRUITER'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Entreprise / Recruteur
          </button>
        </div>

        {/* MESSAGE D'ERREUR */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* CHAMPS CANDIDAT */}
          {role === 'CANDIDATE' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Prénom</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Mohamed"
                  className="w-full px-3 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nom</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ben Salah"
                  className="w-full px-3 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* CHAMPS RECRUTEUR */}
          {role === 'RECRUITER' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Raison sociale (Nom de l'entreprise)</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Vermeg Tunisie, Telnet, Instadeep..."
                    className="w-full pl-9 pr-3 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Matricule Fiscal RNE <span className="text-slate-400 font-normal">(format: 1234567A/A/M/000)</span>
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="1234567A/A/M/000 (généré automatiquement si vide)"
                    className="w-full pl-9 pr-3 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* EMAIL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Adresse email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'CANDIDATE' ? 'votre-nom@gmail.com' : 'rh@votre-entreprise.tn'}
                className="w-full pl-9 pr-3 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* TELEPHONE */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Téléphone portable (+216 Tunisie)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+216 98 123 456"
                className="w-full pl-9 pr-3 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* MOT DE PASSE */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mot de passe sécurisé</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Au moins 8 caractères"
                className="w-full pl-9 pr-3 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* RGPD / INPDP CONSENTEMENT */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
            En créant votre compte, vous acceptez les conditions d'utilisation et le traitement de vos données conformément à la <b>Loi tunisienne n° 2004-63 (INPDP)</b> sur la protection des données à caractère personnel.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                Créer mon compte <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t text-center text-xs text-slate-600">
          Vous avez déjà un compte ?{' '}
          <Link href="/connexion" className="text-blue-600 font-bold hover:underline">
            Connectez-vous ici
          </Link>
        </div>
      </div>
    </div>
  );
}
