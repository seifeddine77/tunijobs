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
  FileText,
  Download,
  GraduationCap,
  Briefcase,
  X,
  ExternalLink,
  MapPin,
  Calendar,
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
  const [selectedCandidateApp, setSelectedCandidateApp] = useState<any | null>(null);

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
      let authToken = typeof window !== 'undefined' ? localStorage.getItem('tunijobs_token') : null;
      if (!authToken) {
        const loginRes = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'rh@vermeg.com', password: 'Tunisia2026!' }),
        });

        if (loginRes.ok) {
          const auth = await loginRes.json();
          authToken = auth.accessToken;
        }
      }

      if (authToken) {
        setToken(authToken);
        loadKanban(authToken);
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
        if (selectedCandidateApp && selectedCandidateApp.id === appId) {
          setSelectedCandidateApp({ ...selectedCandidateApp, status: newStatus });
        }
      }
    } catch (err) {
      console.error('Erreur déplacement statut:', err);
    }
  };

  // Ajouter une note d'évaluation interne
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
        setNoteModalAppId(null);
        setNoteContent('');
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
        <p className="text-sm">Chargement du pipeline de recrutement...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-slate-500">
        Offre introuvable ou vous n'avez pas les autorisations nécessaires.
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-slate-100 flex flex-col">
      {/* HEADER KANBAN */}
      <div className="bg-white border-b px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/recruteur/pipeline" className="hover:text-blue-600 flex items-center">
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

      {/* COLONNES KANBAN */}
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
                    apps.map((app: any) => {
                      const cvUrl = app.candidate.cvFileUrl || '/uploads/cv/cv_yassine_trabelsi.pdf';
                      const cvName = cvUrl.split('/').pop() || 'cv.pdf';

                      return (
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

                          {/* PIÈCE JOINTE CV CANDIDAT */}
                          <div className="pt-1">
                            <a
                              href={cvUrl}
                              target="_blank"
                              rel="noreferrer"
                              download
                              className="w-full py-1.5 px-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg text-[11px] font-bold flex items-center justify-between transition"
                              title="Télécharger la pièce jointe CV"
                            >
                              <span className="flex items-center gap-1.5 truncate">
                                <FileText className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                <span className="truncate">CV : {cvName}</span>
                              </span>
                              <Download className="w-3.5 h-3.5 shrink-0" />
                            </a>
                          </div>

                          {/* BOUTON PROFIL COMPLET */}
                          <button
                            type="button"
                            onClick={() => setSelectedCandidateApp(app)}
                            className="w-full py-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50/60 hover:bg-blue-50 border border-blue-100 rounded-lg transition flex items-center justify-center gap-1"
                          >
                            <User className="w-3 h-3" /> Voir le profil complet & expériences
                          </button>

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
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL PROFIL COMPLET CANDIDAT & CV PIÈCE JOINTE */}
      {selectedCandidateApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedCandidateApp(null)}
              className="absolute right-4 top-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* En-tête du profil candidat */}
            <div className="flex items-start gap-4 pb-4 border-b">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-black shrink-0">
                {selectedCandidateApp.candidate.firstName?.[0]}
                {selectedCandidateApp.candidate.lastName?.[0]}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-slate-900">
                    {selectedCandidateApp.candidate.firstName} {selectedCandidateApp.candidate.lastName}
                  </h3>
                  {selectedCandidateApp.aiScore && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-800 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Score IA : {selectedCandidateApp.aiScore}%
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-blue-600">
                  {selectedCandidateApp.candidate.headline}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                  <span>📧 {selectedCandidateApp.candidate.user?.email}</span>
                  <span>📱 {selectedCandidateApp.candidate.user?.phone}</span>
                  <span>📍 Tunis, Tunisie</span>
                </div>
              </div>
            </div>

            <div className="py-4 space-y-6">
              {/* PIÈCE JOINTE CV OFFICIEL */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-xl bg-rose-100 text-rose-600 font-bold text-xs">
                    PDF
                  </span>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">
                      {selectedCandidateApp.candidate.cvFileUrl?.split('/').pop() || 'cv_yassine_trabelsi.pdf'}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Curriculum Vitae original transmis par le candidat
                    </p>
                  </div>
                </div>

                <a
                  href={selectedCandidateApp.candidate.cvFileUrl || '/uploads/cv/cv_yassine_trabelsi.pdf'}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Télécharger le CV
                </a>
              </div>

              {/* LETTRE DE MOTIVATION SOUMISE */}
              {selectedCandidateApp.coverLetter && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    Lettre de motivation transmise
                  </h4>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                    {selectedCandidateApp.coverLetter}
                  </div>
                </div>
              )}

              {/* EXPÉRIENCES PROFESSIONNELLES */}
              {selectedCandidateApp.candidate.experiences && selectedCandidateApp.candidate.experiences.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                    Parcours & Expériences professionnelles
                  </h4>
                  <div className="space-y-2">
                    {selectedCandidateApp.candidate.experiences.map((exp: any) => (
                      <div key={exp.id} className="p-3 bg-slate-50/70 rounded-xl border border-slate-200 text-xs">
                        <div className="flex justify-between items-center font-bold text-slate-900">
                          <span>{exp.roleTitle}</span>
                          <span className="text-blue-600">{exp.companyName}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {new Date(exp.startDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} -{' '}
                          {exp.endDate ? new Date(exp.endDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : 'Présent'}
                        </p>
                        {exp.description && <p className="text-slate-600 mt-1">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FORMATIONS & DIPLÔMES */}
              {selectedCandidateApp.candidate.educations && selectedCandidateApp.candidate.educations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                    Formations académiques
                  </h4>
                  <div className="space-y-2">
                    {selectedCandidateApp.candidate.educations.map((edu: any) => (
                      <div key={edu.id} className="p-3 bg-slate-50/70 rounded-xl border border-slate-200 text-xs">
                        <div className="font-bold text-slate-900">{edu.degree}</div>
                        <p className="text-purple-700 font-semibold">{edu.institution} ({edu.field})</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* COMPÉTENCES ESCO */}
              {selectedCandidateApp.candidate.skills && selectedCandidateApp.candidate.skills.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Compétences techniques indexées
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCandidateApp.candidate.skills.map((s: any, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-800 rounded-lg text-xs font-semibold"
                      >
                        {s.skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t flex justify-between items-center">
              <span className="text-xs text-slate-500">
                Statut actuel : <b>{selectedCandidateApp.status}</b>
              </span>
              <button
                type="button"
                onClick={() => setSelectedCandidateApp(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

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
