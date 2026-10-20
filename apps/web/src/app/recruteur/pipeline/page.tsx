'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, ArrowRight, Sparkles, Users, PlusCircle } from 'lucide-react';

export default function RecruiterPipelineSelectorPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  useEffect(() => {
    async function loadRecruiterOffers() {
      try {
        let token = typeof window !== 'undefined' ? localStorage.getItem('tunijobs_token') : null;
        if (!token) {
          const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'rh@vermeg.com', password: 'Tunisia2026!' }),
          });

          if (loginRes.ok) {
            const auth = await loginRes.json();
            token = auth.accessToken;
          }
        }

        if (token) {
          const res = await fetch(`${API_URL}/companies/me/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            const data = await res.json();
            setOffers(data.offers || []);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadRecruiterOffers();
  }, [API_URL]);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b mb-6 gap-4">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Espace Recruteur · Vermeg Tunisie
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Pipeline Kanban de Recrutement
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gérez les candidatures reçues, les étapes d'évaluation et planifiez les entretiens.
          </p>
        </div>

        <Link
          href="/recruteur/offres/nouvelle"
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Publier une offre
        </Link>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-xs">Chargement de vos offres...</p>
        </div>
      ) : offers.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 text-slate-500 space-y-4">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Aucune offre publiée pour le moment</h3>
            <p className="text-xs text-slate-400 mt-1">
              Publiez votre première offre d'emploi pour commencer à recevoir des candidatures qualifiées.
            </p>
          </div>
          <Link
            href="/recruteur/offres/nouvelle"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow hover:bg-blue-700 transition"
          >
            <PlusCircle className="w-4 h-4" /> Publier une offre maintenant
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-500 shadow-sm transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                    {offer.contractType}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Gouvernorat {offer.governorateCode}
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 mt-1">
                  {offer.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {offer._count?.applications || 0} candidat(s) dans le pipeline
                </p>
              </div>

              <Link
                href={`/recruteur/offres/${offer.id}/kanban`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1"
              >
                Ouvrir le Kanban <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
