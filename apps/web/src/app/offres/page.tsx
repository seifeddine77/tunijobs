'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { JobFilters, FilterState } from '@/components/jobs/JobFilters';
import { JobCard } from '@/components/jobs/JobCard';
import { TunisiaMap } from '@/components/map/TunisiaMap';
import {
  ListFilter,
  Map as MapIcon,
  Columns,
  Sparkles,
  SlidersHorizontal,
  X,
  MapPin,
} from 'lucide-react';
import { TUNISIAN_GOVERNORATES } from '@tunijobs/shared-types';

const INITIAL_FILTERS: FilterState = {
  q: '',
  governorate: '',
  contractType: '',
  workMode: '',
  minSalary: 0,
};

function OffresContent() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  // Synchronisation avec les query params de l'URL (?governorate=11&contractType=SIVP...)
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const gov = searchParams.get('governorate') || '';
    const contract = searchParams.get('contractType') || '';
    const mode = searchParams.get('workMode') || '';
    const salary = Number(searchParams.get('minSalary')) || 0;

    if (q || gov || contract || mode || salary) {
      setFilters({
        q,
        governorate: gov,
        contractType: contract,
        workMode: mode,
        minSalary: salary,
      });
    }
  }, [searchParams]);
  const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>('split');
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobsGeoJson, setJobsGeoJson] = useState<any>(null);
  const [choroplethData, setChoroplethData] = useState<Record<string, number>>({});
  const [focusedLocation, setFocusedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [nearMeActive, setNearMeActive] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  // Charger les données du choroplèthe au montage
  useEffect(() => {
    async function loadChoropleth() {
      try {
        const res = await fetch(`${API_URL}/jobs/geo/choropleth`);
        if (res.ok) {
          const data = await res.json();
          setChoroplethData(data.counts || {});
        }
      } catch (err) {
        console.error('Erreur chargement choroplèthe:', err);
      }
    }
    loadChoropleth();
  }, [API_URL]);

  // Charger les offres et les points GeoJSON selon les filtres
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.q) params.set('q', filters.q);
      if (filters.governorate) params.set('governorate', filters.governorate);
      if (filters.contractType) params.set('contractType', filters.contractType);
      if (filters.workMode) params.set('workMode', filters.workMode);
      if (filters.minSalary > 0) params.set('minSalary', String(filters.minSalary));

      // 1. Liste paginée des offres
      const listRes = await fetch(`${API_URL}/jobs?${params.toString()}`);
      if (listRes.ok) {
        const listData = await listRes.json();
        setJobs(listData.items || []);
        setTotalCount(listData.meta?.total || 0);
      }

      // 2. GeoJSON synchronisé pour la carte
      const geoRes = await fetch(`${API_URL}/jobs/geo/points?${params.toString()}`);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        setJobsGeoJson(geoData);
      }
    } catch (err) {
      console.error('Erreur chargement offres:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, API_URL]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Sélection d'un gouvernorat depuis la carte
  const handleSelectGovernorateOnMap = (code: string | null) => {
    setFilters((prev) => ({
      ...prev,
      governorate: code || '',
    }));
  };

  // Centrage de la carte sur une offre précise
  const handleLocateJob = (lat: number, lng: number) => {
    setFocusedLocation({ lat, lng });
    if (viewMode === 'list') {
      setViewMode('split');
    }
  };

  // Recherche géolocalisée "Près de moi"
  const handleNearMeLocation = async (lat: number, lng: number) => {
    setLoading(true);
    setNearMeActive(true);
    try {
      const res = await fetch(`${API_URL}/jobs/geo/near-me?lat=${lat}&lng=${lng}&radiusKm=35`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
        setTotalCount(data.length);
      }
    } catch (err) {
      console.error('Erreur near-me:', err);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer le nom du gouvernorat actif
  const activeGovInfo = TUNISIAN_GOVERNORATES.find((g) => g.code === filters.governorate);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      {/* HEADER AVEC STATS ET BASCULEURS DE VUE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Offres d'emploi en Tunisie
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
              {totalCount} offre{totalCount > 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Recherche synchronisée avec la carte des 24 gouvernorats tunisiens et recommandations IA.
          </p>
        </div>

        {/* BASCULEURS DE VUE (Split / Liste / Carte) */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {/* Bouton Filtres Mobile */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            Filtres
          </button>

          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                viewMode === 'split'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Vue Split</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Liste</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                viewMode === 'map'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Carte</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAGS DE FILTRES ACTIFS */}
      {(filters.governorate || filters.contractType || filters.workMode || filters.q || nearMeActive) && (
        <div className="flex flex-wrap items-center gap-2 py-3">
          <span className="text-xs font-semibold text-slate-500">Filtres actifs :</span>
          {activeGovInfo && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              📍 {activeGovInfo.nameFr} ({activeGovInfo.nameAr})
              <button
                onClick={() => setFilters((f) => ({ ...f, governorate: '' }))}
                className="ml-1.5 hover:text-rose-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {filters.contractType && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              💼 {filters.contractType}
              <button
                onClick={() => setFilters((f) => ({ ...f, contractType: '' }))}
                className="ml-1.5 hover:text-rose-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {filters.workMode && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border">
              🌐 {filters.workMode}
              <button
                onClick={() => setFilters((f) => ({ ...f, workMode: '' }))}
                className="ml-1.5 hover:text-rose-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {nearMeActive && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
              🎯 Autour de moi (35 km)
              <button
                onClick={() => {
                  setNearMeActive(false);
                  fetchJobs();
                }}
                className="ml-1.5 hover:text-rose-900"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* DISPOSITION PRINCIPALE (GRILLE) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
        {/* COLONNE GAUCHE : FILTRES DESKTOP */}
        <aside className="hidden lg:block lg:col-span-3">
          <JobFilters
            filters={filters}
            onChange={(newF) => {
              setNearMeActive(false);
              setFilters(newF);
            }}
            onReset={() => {
              setNearMeActive(false);
              setFilters(INITIAL_FILTERS);
            }}
          />
        </aside>

        {/* CONTENU PRINCIPAL : LISTE & CARTE */}
        <div
          className={`lg:col-span-9 grid gap-6 ${
            viewMode === 'split'
              ? 'grid-cols-1 md:grid-cols-12'
              : 'grid-cols-1'
          }`}
        >
          {/* PANNEAU LISTE DES OFFRES */}
          {(viewMode === 'split' || viewMode === 'list') && (
            <div
              className={`${
                viewMode === 'split' ? 'md:col-span-6' : 'w-full'
              } space-y-4 overflow-y-auto max-h-[calc(100vh-220px)] pr-1`}
            >
              {loading ? (
                <div className="p-12 text-center text-slate-400">
                  <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
                  <p className="text-sm">Recherche des offres en cours...</p>
                </div>
              ) : jobs.length === 0 ? (
                <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                  <p className="font-bold text-slate-800 text-base">Aucune offre ne correspond à ces critères</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Essayez de réinitialiser vos filtres ou d'élargir la zone géographique.
                  </p>
                  <button
                    onClick={() => {
                      setNearMeActive(false);
                      setFilters(INITIAL_FILTERS);
                    }}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
                  >
                    Voir toutes les offres
                  </button>
                </div>
              ) : (
                jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isSelected={selectedJobId === job.id}
                    onLocate={handleLocateJob}
                  />
                ))
              )}
            </div>
          )}

          {/* PANNEAU CARTE MAPLIBRE */}
          {(viewMode === 'split' || viewMode === 'map') && (
            <div
              className={`${
                viewMode === 'split'
                  ? 'md:col-span-6 h-[600px] sticky top-24'
                  : 'w-full h-[750px]'
              }`}
            >
              <TunisiaMap
                selectedGovCode={filters.governorate}
                onSelectGovernorate={handleSelectGovernorateOnMap}
                onSelectJob={(id) => setSelectedJobId(id)}
                onNearMeLocation={handleNearMeLocation}
                jobsGeoJson={jobsGeoJson}
                choroplethData={choroplethData}
                focusedLocation={focusedLocation}
              />
            </div>
          )}
        </div>
      </div>

      {/* TIROIR MODAL FILTRES MOBILE */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
          <div className="w-full max-w-xs bg-white h-full p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900">Filtres</h3>
              <button onClick={() => setMobileFilterOpen(false)}>
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <JobFilters
              filters={filters}
              onChange={(newF) => {
                setNearMeActive(false);
                setFilters(newF);
              }}
              onReset={() => {
                setNearMeActive(false);
                setFilters(INITIAL_FILTERS);
                setMobileFilterOpen(false);
              }}
            />
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full mt-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs"
            >
              Appliquer les filtres
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OffresPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-slate-400">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-xs">Chargement des offres d'emploi...</p>
        </div>
      }
    >
      <OffresContent />
    </Suspense>
  );
}
