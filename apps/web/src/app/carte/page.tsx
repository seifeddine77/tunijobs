'use client';

import React, { useState, useEffect } from 'react';
import { TunisiaMap } from '@/components/map/TunisiaMap';
import { JobCard } from '@/components/jobs/JobCard';
import { TUNISIAN_GOVERNORATES } from '@tunijobs/shared-types';
import { X, MapPin, Briefcase, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function FullMapPage() {
  const [selectedGovCode, setSelectedGovCode] = useState<string | null>(null);
  const [govJobs, setGovJobs] = useState<any[]>([]);
  const [choroplethData, setChoroplethData] = useState<Record<string, number>>({});
  const [jobsGeoJson, setJobsGeoJson] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  // Charger les données initiales de la carte
  useEffect(() => {
    async function loadData() {
      try {
        const [choroRes, geoRes] = await Promise.all([
          fetch(`${API_URL}/jobs/geo/choropleth`),
          fetch(`${API_URL}/jobs/geo/points`),
        ]);

        if (choroRes.ok) {
          const choro = await choroRes.json();
          setChoroplethData(choro.counts || {});
        }

        if (geoRes.ok) {
          const geo = await geoRes.json();
          setJobsGeoJson(geo);
        }
      } catch (err) {
        console.error('Erreur chargement données carte:', err);
      }
    }
    loadData();
  }, [API_URL]);

  // Quand un utilisateur clique sur un gouvernorat sur la carte
  const handleSelectGov = async (code: string | null) => {
    setSelectedGovCode(code);
    if (!code) {
      setDrawerOpen(false);
      return;
    }

    setLoading(true);
    setDrawerOpen(true);
    try {
      const res = await fetch(`${API_URL}/jobs?governorate=${code}`);
      if (res.ok) {
        const data = await res.json();
        setGovJobs(data.items || []);
      }
    } catch (err) {
      console.error('Erreur chargement offres gouvernorat:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentGov = TUNISIAN_GOVERNORATES.find((g) => g.code === selectedGovCode);

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden">
      {/* CARTE PLEIN ÉCRAN */}
      <div className="w-full h-full">
        <TunisiaMap
          selectedGovCode={selectedGovCode || undefined}
          onSelectGovernorate={handleSelectGov}
          jobsGeoJson={jobsGeoJson}
          choroplethData={choroplethData}
        />
      </div>

      {/* BANNIÈRE D'AIDE FLOTTANTE EN HAUT */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white/95 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-2 pointer-events-none">
        <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-ping" />
        <span>Cliquez sur l'un des 24 gouvernorats pour explorer les offres locales</span>
      </div>

      {/* TIROIR LATÉRAL DES OFFRES DU GOUVERNORAT SÉLECTIONNÉ */}
      {drawerOpen && currentGov && (
        <div className="absolute top-0 right-0 bottom-0 z-20 w-full sm:w-[420px] bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          {/* Header du tiroir */}
          <div className="p-4 border-b flex items-center justify-between bg-slate-50">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🇹🇳</span>
                <h2 className="font-extrabold text-slate-900 text-lg">
                  {currentGov.nameFr}
                </h2>
                <span className="text-sm text-slate-500 font-arabic">
                  ({currentGov.nameAr})
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Région {currentGov.region} · {govJobs.length} offre{govJobs.length > 1 ? 's' : ''} disponible{govJobs.length > 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Liste des délégations du gouvernorat */}
          <div className="px-4 py-2.5 bg-blue-50/50 border-b text-[11px] text-slate-600 flex flex-wrap gap-1">
            <span className="font-bold text-blue-900 mr-1">Délégations :</span>
            {currentGov.delegations.slice(0, 5).map((del, i) => (
              <span key={i} className="bg-white px-2 py-0.5 rounded border border-blue-100">
                {del}
              </span>
            ))}
            {currentGov.delegations.length > 5 && (
              <span className="text-slate-400">+{currentGov.delegations.length - 5} autres</span>
            )}
          </div>

          {/* Liste des offres du gouvernorat */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="text-center py-12 text-slate-400">
                <div className="animate-spin w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-xs">Chargement des offres...</p>
              </div>
            ) : govJobs.length === 0 ? (
              <div className="text-center py-12 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <p className="font-bold text-slate-800 text-sm">Aucune offre active pour le moment</p>
                <p className="text-xs text-slate-500 mt-1">
                  Soyez le premier à publier une offre pour la région {currentGov.nameFr}.
                </p>
                <Link
                  href="/offres"
                  className="mt-3 inline-block px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold"
                >
                  Voir les autres régions
                </Link>
              </div>
            ) : (
              govJobs.map((job) => <JobCard key={job.id} job={job} />)
            )}
          </div>

          {/* Footer du tiroir */}
          <div className="p-3 border-t bg-slate-50 text-center">
            <Link
              href={`/offres?governorate=${currentGov.code}`}
              className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              Voir la vue filtrée complète dans le moteur <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
