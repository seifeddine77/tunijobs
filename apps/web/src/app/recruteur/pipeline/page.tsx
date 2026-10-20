'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, ArrowRight, Sparkles, Users } from 'lucide-react';

export default function RecruiterPipelineSelectorPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  useEffect(() => {
    async function loadRecruiterOffers() {
      try {
        const loginRes = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'rh@vermeg.com', password: 'Tunisia2026!' }),
        });

        if (loginRes.ok) {
          const auth = await loginRes.json();
          const res = await fetch(`${API_URL}/companies/me/dashboard`, {
            headers: { Authorization: `Bearer ${auth.accessToken}` },
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
      <div className="pb-6 border-b mb-6">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
          Espace Recruteur · Vermeg Tunisie
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
          Sélectionnez une offre pour ouvrir le Pipeline Kanban
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Gérez les candidatures, les étapes de présélection, les entretiens et les notes internes.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-xs">Chargement de vos offres...</p>
        </div>
      ) : offers.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-dashed text-slate-500">
          Aucune offre publiée pour le moment.
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-500 shadow-sm transition flex items-center justify-between"
            >
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                  {offer.contractType}
                </span>
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
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1"
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
