'use client';

import React, { useState } from 'react';
import { X, Send, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface ApplyModalProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ApplyModal({
  jobId,
  jobTitle,
  companyName,
  isOpen,
  onClose,
  onSuccess,
}: ApplyModalProps) {
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

    try {
      // Connecté par défaut avec le compte de démonstration candidat
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'candidat@tunijobs.tn', password: 'Tunisia2026!' }),
      });

      if (!loginRes.ok) {
        throw new Error('Erreur d\'authentification candidat');
      }

      const { accessToken } = await loginRes.json();

      const applyRes = await fetch(`${API_URL}/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ coverLetter }),
      });

      if (!applyRes.ok) {
        const data = await applyRes.json();
        throw new Error(data.message || 'Erreur lors de la soumission');
      }

      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">
              Candidature envoyée avec succès !
            </h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto mb-6">
              Votre profil et vos compétences ont été transmis à <b>{companyName}</b>. Le recruteur a été notifié par email et via son pipeline de recrutement.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                Candidature en 1 clic
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                {jobTitle}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Entreprise : {companyName}
              </p>
            </div>

            {/* Encadré Profil automatique */}
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-slate-700 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-blue-900">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Transmission automatique de votre profil TuniJobs :
              </div>
              <p className="text-[11px] text-slate-600">
                • Identité : Yassine Trabelsi (Compte démo Candidat)<br />
                • Titre : Ingénieur Développeur Full-Stack (3 ans exp)<br />
                • Compétences : TypeScript, React, NestJS, PostgreSQL
              </p>
            </div>

            {/* Lettre de motivation ou mot d'accompagnement */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Message d'accompagnement (facultatif)
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Présentez brièvement vos motivations, votre disponibilité ou vos prétentions..."
                rows={4}
                className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 focus:bg-white transition"
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {loading ? 'Transmission...' : 'Envoyer ma candidature'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
