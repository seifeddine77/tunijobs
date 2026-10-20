'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Sparkles,
  Phone,
  Mail,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Plus,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  border: string;
}

const COLUMNS: KanbanColumn[] = [
  { id: 'RECEIVED', title: 'Reçues', color: 'bg-blue-50 text-blue-800', border: 'border-blue-200' },
  { id: 'SCREENED', title: 'Présélection', color: 'bg-amber-50 text-amber-800', border: 'border-amber-200' },
  { id: 'INTERVIEW', title: 'Entretiens', color: 'bg-indigo-50 text-indigo-800', border: 'border-indigo-200' },
  { id: 'OFFER', title: 'Offres faites', color: 'bg-emerald-50 text-emerald-800', border: 'border-emerald-200' },
  { id: 'REJECTED', title: 'Refusées', color: 'bg-slate-100 text-slate-700', border: 'border-slate-200' },
];

export default function RecruiterKanbanPage({
  params,
}: {
  params: { id: string };
}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string>('');
  const [noteModalAppId, setNoteModalAppId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  const loadKanban = async (authToken: string) => {
    try {
      const res = await fetch(`${API_URL}/recruiter/jobs/${params.id}/applications`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const kanbanData = await res.json();
        setData(kanbanData);
      }
    } catch (err) {
      console.error('Erreur chargement Kanban:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      // Connecté par défaut avec le compte de démo Vermeg Tunisie
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'rh@vermeg.com', password: 'Tunisia2026!' }),
      });

      if (loginRes.ok) {
        const auth = await loginRes.json();
        setToken(auth.accessToken);
        loadKanban(auth.accessToken);
      } else {
        setLoading(false);
      }
    }
    init();
  }, [params.id, API_URL]);

  // Déplacer un candidat vers un nouveau statut
  const handleMoveStatus = async (appId: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_URL}/applications/${appId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        await loadKanban(token);
      }
    } catch (err) {
      console.error('Erreur déplacement statut:', err);
    }
  };

  // Ajouter une note interne
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteModalAppId || !noteContent.trim()) return;

    try {
      const res = await fetch(`${API_URL}/applications/${noteModalAppId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: noteContent }),
      });

      if (res.ok) {
        setNoteContent('');
        setNoteModalAppId(null);
        await loadKanban(token);
      }
    } catch (err) {
      console.error('Erreur ajout note:', err);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm">Chargement du pipeline Kanban...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-bold text-slate-800">Offre introuvable ou accès non autorisé</h2>
        <Link href="/offres" className="mt-4 inline-block text-blue-600 text-xs font-bold">
          Retour aux offres
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-slate-100 flex flex-col">
      {/* HEADER KANBAN */}
      <div className="bg-white border-b px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/offres" className="hover:text-blue-600 flex items-center">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Mes offres
            </Link>
            <span>/</span>
            <span>Pipeline Recrutement</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <span>📋 {data.job.title}</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {data.total} candidat{data.total > 1 ? 's' : ''}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Link
            href={`/offres/${data.job.slug}`}
            className="px-3 py-1.5 border border-slate-200 rounded-lg font-semibold hover:bg-slate-50 transition"
          >
            Voir la fiche publique ↗
          </Link>
        </div>
      </div>

      {/* COLONNES KANBAN SCROLLABLES HORIZONTALEMENT */}
      <div className="flex-1 p-6 overflow-x-auto">
        <div className="flex gap-4 min-w-[1200px] h-[calc(100vh-170px)]">
          {COLUMNS.map((col) => {
            const apps = data.kanban[col.id] || [];

            return (
              <div
                key={col.id}
                className="w-80 flex-shrink-0 flex flex-col bg-slate-200/60 rounded-2xl border border-slate-300/70 p-3"
              >
                {/* Header de la colonne */}
                <div className="flex items-center justify-between pb-3 mb-2 px-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-extrabold ${col.color}`}>
                      {col.title}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {apps.length}
                    </span>
                  </div>
                </div>

                {/* Liste des cartes candidats */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {apps.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-300 rounded-xl">
                      Aucun candidat
                    </div>
                  ) : (
                    apps.map((app: any) => (
                      <div
                        key={app.id}
                        className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow transition space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 leading-tight">
                              {app.candidate.firstName} {app.candidate.lastName}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                              {app.candidate.headline || 'Candidat qualifié'}
                            </p>
                          </div>

                          {/* Score IA */}
                          {app.aiScore && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-100 text-blue-800 shrink-0 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              {app.aiScore}%
                            </span>
                          )}
                        </div>

                        {/* Coordonnées */}
                        <div className="space-y-1 text-[11px] text-slate-600">
                          {app.candidate.user?.email && (
                            <div className="flex items-center gap-1.5 truncate">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{app.candidate.user.email}</span>
                            </div>
                          )}
                          {app.candidate.user?.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{app.candidate.user.phone}</span>
                            </div>
                          )}
                        </div>

                        {/* Compétences clés */}
                        {app.candidate.skills && app.candidate.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {app.candidate.skills.slice(0, 3).map((s: any, idx: number) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px]"
                              >
                                {s.skill.name}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Notes internes */}
                        {app.notes && app.notes.length > 0 && (
                          <div className="p-2 bg-amber-50/70 border border-amber-200 rounded-lg text-[11px] text-amber-900">
                            <span className="font-bold">📝 Note :</span> {app.notes[0].content}
                          </div>
                        )}

                        {/* Actions du pipeline (Avancer / Reculer) */}
                        <div className="pt-2 border-t flex items-center justify-between text-xs">
                          <button
                            onClick={() => setNoteModalAppId(app.id)}
                            className="text-[11px] font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3" />
                            Note
                          </button>

                          <div className="flex items-center gap-1">
                            {col.id === 'RECEIVED' && (
                              <button
                                onClick={() => handleMoveStatus(app.id, 'SCREENED')}
                                className="px-2 py-1 bg-blue-600 text-white rounded text-[10px] font-bold hover:bg-blue-700 transition"
                              >
                                Présélectionner →
                              </button>
                            )}
                            {col.id === 'SCREENED' && (
                              <button
                                onClick={() => handleMoveStatus(app.id, 'INTERVIEW')}
                                className="px-2 py-1 bg-indigo-600 text-white rounded text-[10px] font-bold hover:bg-indigo-700 transition"
                              >
                                Entretien →
                              </button>
                            )}
                            {col.id === 'INTERVIEW' && (
                              <button
                                onClick={() => handleMoveStatus(app.id, 'OFFER')}
                                className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold hover:bg-emerald-700 transition"
                              >
                                Offre d'embauche →
                              </button>
                            )}
                            {col.id !== 'REJECTED' && (
                              <button
                                onClick={() => handleMoveStatus(app.id, 'REJECTED')}
                                className="px-1.5 py-1 text-slate-400 hover:text-rose-600 rounded text-[10px]"
                                title="Refuser le candidat"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL AJOUT NOTE INTERNE */}
      {noteModalAppId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border">
            <h3 className="font-bold text-slate-900 text-base mb-2">
              Ajouter une note d'évaluation interne
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Cette note sera visible uniquement par l'équipe de recrutement de votre entreprise.
            </p>
            <form onSubmit={handleAddNote}>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Ex: Candidat très prometteur, solides connaissances système, prétention salariale validée à 2500 TND."
                rows={4}
                required
                className="w-full p-3 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setNoteModalAppId(null)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
                >
                  Enregistrer la note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
