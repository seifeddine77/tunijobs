'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  Calendar,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export default function CandidatApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'ALL' | 'ACTIVE' | 'INTERVIEW'>('ALL');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  useEffect(() => {
    async function loadApplications() {
      setLoading(true);
      try {
        // Authentification automatique compte démo candidat
        const loginRes = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'candidat@tunijobs.tn', password: 'Tunisia2026!' }),
        });

        if (loginRes.ok) {
          const { accessToken } = await loginRes.json();
          const res = await fetch(`${API_URL}/candidat/applications`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (res.ok) {
            const data = await res.json();
            setApplications(data);
          }
        }
      } catch (err) {
        console.error('Erreur chargement candidatures:', err);
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  }, [API_URL]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RECEIVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5" /> Reçue
          </span>
        );
      case 'SCREENED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Sparkles className="w-3.5 h-3.5" /> Présélectionnée
          </span>
        );
      case 'INTERVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Calendar className="w-3.5 h-3.5" /> Entretien prévu 🗓️
          </span>
        );
      case 'OFFER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Offre reçue 🎉
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <XCircle className="w-3.5 h-3.5" /> Non retenue
          </span>
        );
      default:
        return null;
    }
  };

  const filtered = applications.filter((app) => {
    if (filterTab === 'ACTIVE') return ['RECEIVED', 'SCREENED'].includes(app.status);
    if (filterTab === 'INTERVIEW') return app.status === 'INTERVIEW';
    return true;
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Suivi de mes candidatures
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Consultez le statut de vos postulations et les retours des recruteurs en direct.
          </p>
        </div>

        <Link
          href="/offres"
          className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-800"
        >
          Découvrir d'autres offres <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {/* TABS DE FILTRE */}
      <div className="flex items-center gap-2 my-6">
        <button
          onClick={() => setFilterTab('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            filterTab === 'ALL'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Toutes ({applications.length})
        </button>
        <button
          onClick={() => setFilterTab('ACTIVE')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            filterTab === 'ACTIVE'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          En cours ({applications.filter((a) => ['RECEIVED', 'SCREENED'].includes(a.status)).length})
        </button>
        <button
          onClick={() => setFilterTab('INTERVIEW')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            filterTab === 'INTERVIEW'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Entretiens ({applications.filter((a) => a.status === 'INTERVIEW').length})
        </button>
      </div>

      {/* LISTE DES CANDIDATURES */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm">Chargement de vos candidatures...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-300 p-8">
          <p className="font-bold text-slate-800 text-base">Aucune candidature dans cette catégorie</p>
          <p className="text-xs text-slate-500 mt-1">
            Parcourez les offres disponibles sur la carte ou le moteur de recherche.
          </p>
          <Link
            href="/offres"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
          >
            Explorer les offres d'emploi
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => (
            <div
              key={app.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-xs text-slate-500">
                      Postulé le {new Date(app.createdAt).toLocaleDateString('fr-TN')}
                    </span>
                    {getStatusBadge(app.status)}
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    <Link
                      href={`/offres/${app.jobOffer.slug}`}
                      className="hover:text-blue-600 transition"
                    >
                      {app.jobOffer.title}
                    </Link>
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-1">
                    <span className="flex items-center font-medium">
                      <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {app.jobOffer.company.name}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-rose-500" />
                      {app.jobOffer.governorate?.nameFr}
                    </span>
                  </div>
                </div>

                {/* Score IA Badge */}
                {app.aiScore && (
                  <div className="sm:text-right shrink-0">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 rounded-xl text-xs font-extrabold text-blue-700">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Match IA : {app.aiScore}%
                    </div>
                  </div>
                )}
              </div>

              {/* Explication du score IA */}
              {app.aiExplanation && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                  <span className="font-bold text-slate-800">Analyse de profil :</span> {app.aiExplanation}
                </div>
              )}

              {/* Message d'accompagnement */}
              {app.coverLetter && (
                <p className="text-xs text-slate-500 italic border-l-2 border-slate-200 pl-3">
                  "{app.coverLetter}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
