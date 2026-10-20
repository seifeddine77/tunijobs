import React from 'react';
import Link from 'next/link';
import {
  Briefcase,
  MapPin,
  Sparkles,
  Building2,
  Search,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { TUNISIAN_GOVERNORATES } from '@tunijobs/shared-types';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-slate-50 py-20 px-4 sm:px-6 border-b">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-6 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
            Plateforme nationale d'emploi intelligente pour la Tunisie 🇹🇳
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Trouvez l'emploi idéal sur les <br />
            <span className="text-blue-600">24 gouvernorats tunisiens</span>
          </h1>

          <p className="mt-5 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            Matching prédictif par intelligence artificielle, cartographie interactive en temps réel et contrats réglementaires (CDI, CDD, SIVP, Karama).
          </p>

          {/* SEARCH BAR WIDGET */}
          <div className="mt-8 p-3 bg-white rounded-2xl shadow-xl border border-slate-200 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-3 text-left">
            <div className="md:col-span-5 flex items-center px-3 py-2 border rounded-xl bg-slate-50 border-slate-200">
              <Search className="w-5 h-5 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Métier, mot-clé (ex: Fullstack, DevOps)"
                className="bg-transparent w-full focus:outline-none text-sm text-slate-800 placeholder-slate-400"
              />
            </div>

            <div className="md:col-span-4 flex items-center px-3 py-2 border rounded-xl bg-slate-50 border-slate-200">
              <MapPin className="w-5 h-5 text-rose-500 mr-2 shrink-0" />
              <select className="bg-transparent w-full focus:outline-none text-sm text-slate-800">
                <option value="">Tous les gouvernorats (24)</option>
                {TUNISIAN_GOVERNORATES.map((gov) => (
                  <option key={gov.code} value={gov.code}>
                    {gov.nameFr} ({gov.nameAr})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <Link
                href="/offres"
                className="w-full h-full min-h-[46px] flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition shadow-md"
              >
                Rechercher
              </Link>
            </div>
          </div>

          {/* QUICK TAGS */}
          <div className="mt-4 flex flex-wrap justify-center items-center gap-2 text-xs text-slate-500">
            <span className="font-medium text-slate-700">Populaire :</span>
            <span className="px-2.5 py-1 bg-white border rounded-full hover:border-blue-400 cursor-pointer">SIVP</span>
            <span className="px-2.5 py-1 bg-white border rounded-full hover:border-blue-400 cursor-pointer">CDI Hybride</span>
            <span className="px-2.5 py-1 bg-white border rounded-full hover:border-blue-400 cursor-pointer">NestJS / React</span>
            <span className="px-2.5 py-1 bg-white border rounded-full hover:border-blue-400 cursor-pointer">Grand Tunis</span>
            <span className="px-2.5 py-1 bg-white border rounded-full hover:border-blue-400 cursor-pointer">Sfax Tech</span>
          </div>
        </div>
      </section>

      {/* 3 CORE PILLARS */}
      <section className="py-16 px-4 sm:px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Une technologie conçue pour le marché du travail tunisien
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Fini les recherches fastidieuses. TuniJobs synchronise cartographie géospatiale et IA éthique.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* CARD 1 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Carte Choroplèthe & Proximité</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Visualisez la densité d'opportunités par gouvernorat (du Grand Tunis à Tataouine) et filtrez les offres à proximité de votre domicile.
              </p>
            </div>

            {/* CARD 2 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Diagnostic & Scoring IA de CV</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Extraction OCR multilingue (FR/AR/EN), analyse des compétences clés et recommandations transparentes avec explications point par point.
              </p>
            </div>

            {/* CARD 3 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Entreprises & Offres Vérifiées</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Validation rigoureuse des matricules fiscaux tunisiens et respect strict de la loi n° 2004-63 de l'INPDP sur la vie privée.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SAMPLE OFFERS PREVIEW */}
      <section className="py-16 px-4 sm:px-6 bg-slate-50 border-t">
        <div className="container mx-auto max-w-5xl">
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Offres Récentes</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Dernières opportunités en Tunisie</h2>
            </div>
            <Link
              href="/offres"
              className="hidden sm:inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              Voir toutes les offres <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="space-y-4">
            {/* Offer Item 1 */}
            <div className="p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700">CDI</span>
                  <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">Hybride</span>
                  <span className="text-xs text-slate-400">Publié il y a 2j</span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mt-2">Développeur Full-Stack NestJS & React</h4>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-1">
                  <span className="flex items-center"><Building2 className="w-3.5 h-3.5 mr-1 text-slate-400" /> Vermeg Tunisie</span>
                  <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-rose-500" /> Tunis (Lac 2)</span>
                  <span className="font-semibold text-slate-800">2 400 - 3 200 TND</span>
                </div>
              </div>
              <div className="shrink-0">
                <Link
                  href="/offres/developpeur-full-stack-nestjs-react-tunis"
                  className="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition"
                >
                  Voir l'offre
                </Link>
              </div>
            </div>

            {/* Offer Item 2 */}
            <div className="p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-700">SIVP</span>
                  <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">Présentiel</span>
                  <span className="text-xs text-slate-400">Publié hier</span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mt-2">Développeur Mobile Flutter (Contrat SIVP)</h4>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-1">
                  <span className="flex items-center"><Building2 className="w-3.5 h-3.5 mr-1 text-slate-400" /> Telnet Holding</span>
                  <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-rose-500" /> Sfax (Technopôle)</span>
                  <span className="font-semibold text-slate-800">1 200 - 1 500 TND</span>
                </div>
              </div>
              <div className="shrink-0">
                <Link
                  href="/offres/developpeur-mobile-flutter-sivp-sfax"
                  className="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition"
                >
                  Voir l'offre
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-16 px-4 sm:px-6 bg-blue-600 text-white text-center">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-extrabold">Vous recrutez en Tunisie ?</h2>
          <p className="mt-3 text-blue-100 text-base">
            Publiez vos offres gratuitement, accédez aux profils qualifiés sur les 24 gouvernorats et laissez l'IA classer automatiquement les candidatures les plus pertinentes.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/inscription?role=recruiter"
              className="px-6 py-3 bg-white text-blue-600 font-bold rounded-xl shadow-lg hover:bg-blue-50 transition"
            >
              Créer un compte Entreprise
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
