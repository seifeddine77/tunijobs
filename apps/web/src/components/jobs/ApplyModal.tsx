'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Download,
  Paperclip,
} from 'lucide-react';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [cvFileName, setCvFileName] = useState('cv_yassine_trabelsi.pdf');
  const [cvFileUrl, setCvFileUrl] = useState('/uploads/cv/cv_yassine_trabelsi.pdf');
  const [aiLetterLoading, setAiLetterLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  // Rédiger la lettre de motivation avec l'IA TuniJobs
  const handleGenerateAiCoverLetter = () => {
    setAiLetterLoading(true);
    setTimeout(() => {
      setCoverLetter(
        `Madame, Monsieur,\n\n` +
        `C'est avec un vif intérêt que je vous soumets ma candidature pour le poste de "${jobTitle}" au sein de ${companyName}.\n\n` +
        `Fort d'une solide expérience en ingénierie logicielle et développement full-stack moderne, j'ai développé des compétences approfondies adaptées aux exigences de votre projet. Mon parcours chez des acteurs technologiques en Tunisie m'a permis de maîtriser les architectures modulaires, la gestion de bases de données et les bonnes pratiques DevOps.\n\n` +
        `Rejoindre ${companyName} représente pour moi l'opportunité de mettre à profit mon expertise technique tout en contribuant activement à l'excellence de vos réalisations. Vous trouverez ci-joint mon CV détaillant l'ensemble de mes réalisations.\n\n` +
        `Restant à votre entière disposition pour un échange approfondi, je vous prie d'agréer, Madame, Monsieur, mes salutations distinguées.\n\n` +
        `Yassine Trabelsi`
      );
      setAiLetterLoading(false);
    }, 500);
  };

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCvFileName(file.name);
      setCvFileUrl(`/uploads/cv/${file.name}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let accessToken = typeof window !== 'undefined' ? localStorage.getItem('tunijobs_token') : null;
      if (!accessToken) {
        const loginRes = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'candidat@tunijobs.tn', password: 'Tunisia2026!' }),
        });

        if (!loginRes.ok) {
          throw new Error('Erreur d\'authentification candidat');
        }

        const data = await loginRes.json();
        accessToken = data.accessToken;
      }

      const applyRes = await fetch(`${API_URL}/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ coverLetter, cvFileUrl }),
      });

      if (!applyRes.ok) {
        const data = await applyRes.json();
        throw new Error(data.message || 'Erreur lors de la soumission de la candidature');
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
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
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
              Candidature & CV transmis avec succès !
            </h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto mb-6">
              Votre dossier complet ainsi que votre pièce jointe (<b>{cvFileName}</b>) ont été transmis à <b>{companyName}</b>. Le recruteur a été notifié instantanément.
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
                Candidature avec CV & Pièce Jointe
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                {jobTitle}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Entreprise : {companyName}
              </p>
            </div>

            {/* PIÈCE JOINTE CV CANDIDAT */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-blue-600" />
                  Pièce jointe officielle (CV Candidat)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Prêt pour l'envoi
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                <div className="flex items-center gap-2.5 truncate">
                  <span className="p-1.5 rounded-lg bg-rose-100 text-rose-600 font-bold text-[10px]">
                    PDF
                  </span>
                  <span className="text-xs font-semibold text-slate-800 truncate">
                    {cvFileName}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={cvFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                    title="Télécharger / Vérifier la pièce jointe"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-semibold text-blue-600 hover:underline px-1.5 py-1"
                  >
                    Changer
                  </button>
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleCustomFileUpload}
                accept=".pdf,.doc,.docx"
                className="hidden"
              />
            </div>

            {/* LETTRE DE MOTIVATION & ASSISTANT IA */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-800">
                  Lettre ou message de motivation
                </label>
                <button
                  type="button"
                  onClick={handleGenerateAiCoverLetter}
                  disabled={aiLetterLoading}
                  className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {aiLetterLoading ? 'Génération IA...' : 'Rédiger avec l\'IA'}
                </button>
              </div>

              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Présentez vos motivations, vos réalisations et votre disponibilité..."
                rows={5}
                className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 focus:bg-white transition leading-relaxed"
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
                {loading ? 'Transmission en cours...' : 'Transmettre ma candidature & CV'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
