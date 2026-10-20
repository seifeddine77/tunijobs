import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import {
  Building2,
  MapPin,
  Calendar,
  Briefcase,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ArrowLeft,
  Share2,
  Bookmark,
  Send,
} from 'lucide-react';
import { formatTND } from '@tunijobs/shared-types';
import { ApplyButton } from '@/components/jobs/ApplyButton';

async function getJob(slug: string) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const res = await fetch(`${API_URL}/jobs/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const job = await getJob(params.slug);
  if (!job) {
    return {
      title: 'Offre non trouvée | TuniJobs',
    };
  }

  const location = job.governorate?.nameFr || 'Tunisie';
  return {
    title: `${job.title} - ${job.company?.name || 'Entreprise'} (${location}) | TuniJobs`,
    description: `Postulez à l'offre ${job.title} chez ${job.company?.name} à ${location}. Type de contrat: ${job.contractType}. Recommandations IA et géolocalisation sur TuniJobs.`,
    openGraph: {
      title: `${job.title} | ${job.company?.name}`,
      description: `Découvrez cette opportunité d'emploi à ${location} sur TuniJobs.`,
      locale: 'fr_TN',
      type: 'article',
    },
  };
}

export default async function JobDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const job = await getJob(params.slug);

  if (!job) {
    notFound();
  }

  // Schéma de données structurées Google Jobs (schema.org/JobPosting)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    datePosted: job.createdAt,
    employmentType:
      job.contractType === 'CDI'
        ? 'FULL_TIME'
        : job.contractType === 'STAGE'
        ? 'INTERN'
        : 'CONTRACTOR',
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company?.name || 'Entreprise Partenaire',
      logo: job.company?.logoUrl || undefined,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.governorate?.nameFr || 'Tunis',
        addressRegion: job.governorate?.nameFr || 'Tunisie',
        addressCountry: 'TN',
      },
    },
    baseSalary: job.salaryMin
      ? {
          '@type': 'MonetaryAmount',
          currency: 'TND',
          value: {
            '@type': 'QuantitativeValue',
            minValue: job.salaryMin,
            maxValue: job.salaryMax || job.salaryMin,
            unitText: 'MONTH',
          },
        }
      : undefined,
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl">
      {/* Balise JSON-LD Schema.org pour SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* BOUTON RETOUR */}
      <div className="mb-6">
        <Link
          href="/offres"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Retour aux offres d'emploi
        </Link>
      </div>

      {/* HEADER DE L'OFFRE */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {job.contractType}
              </span>
              <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                {job.workMode === 'ON_SITE'
                  ? 'Présentiel'
                  : job.workMode === 'HYBRID'
                  ? 'Hybride'
                  : 'Télétravail'}
              </span>
              <span className="text-xs text-slate-400">
                Réf: {job.slug.split('-').pop()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {job.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-600 mt-2">
              <span className="flex items-center font-medium">
                <Building2 className="w-4 h-4 mr-1.5 text-slate-400" />
                {job.company?.name}
              </span>
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1.5 text-rose-500" />
                {job.delegation ? `${job.delegation}, ` : ''}
                {job.governorate?.nameFr} ({job.governorate?.nameAr})
              </span>
              {job.salaryMin && (
                <span className="font-bold text-blue-700">
                  {job.salaryMin} - {job.salaryMax} {job.currency}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button className="p-2.5 border rounded-xl hover:bg-slate-50 text-slate-600 transition" title="Sauvegarder">
              <Bookmark className="w-4 h-4" />
            </button>
            <button className="p-2.5 border rounded-xl hover:bg-slate-50 text-slate-600 transition" title="Partager">
              <Share2 className="w-4 h-4" />
            </button>
            <ApplyButton
              jobId={job.id}
              jobTitle={job.title}
              companyName={job.company?.name || 'Entreprise'}
            />
          </div>
        </div>

        {/* ANALYSE DE COMPATIBILITÉ IA */}
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 rounded-full bg-blue-600 animate-pulse" />
              <h3 className="font-bold text-slate-900 text-sm">
                Diagnostic de Compatibilité IA TuniJobs
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-extrabold text-xs shadow-sm">
              Score : 87%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white/80 rounded-lg border border-blue-100">
              <div className="font-bold text-emerald-700 flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="w-4 h-4" />
                Points forts détectés
              </div>
              <p className="text-slate-600">
                Expérience en TypeScript, compétences clés validées, localisation dans votre zone souhaitée.
              </p>
            </div>

            <div className="p-3 bg-white/80 rounded-lg border border-blue-100">
              <div className="font-bold text-amber-700 flex items-center gap-1.5 mb-1">
                <AlertCircle className="w-4 h-4" />
                Compétences à valoriser
              </div>
              <p className="text-slate-600">
                Notions d'orchestration Docker et gestion d'architectures distribuées requises.
              </p>
            </div>

            <div className="p-3 bg-white/80 rounded-lg border border-blue-100">
              <div className="font-bold text-blue-700 flex items-center gap-1.5 mb-1">
                <Lightbulb className="w-4 h-4" />
                Conseil pour votre candidature
              </div>
              <p className="text-slate-600">
                Mentionnez vos réalisations chiffrées en production pour maximiser l'intérêt du recruteur.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CORPS DE L'OFFRE (DESCRIPTION & PRÉREQUIS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* DESCRIPTION */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b">
              Description du poste
            </h2>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {job.description}
            </div>
          </div>

          {/* PRÉREQUIS */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b">
              Profil recherché & Compétences
            </h2>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {job.requirements}
            </div>

            {/* Badges compétences */}
            {job.skills && job.skills.length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Compétences techniques clés :
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {job.skills.map((s: any, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold"
                    >
                      {s.skill?.name || s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR ENTREPRISE & LOCALISATION */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-3">
              À propos de l'entreprise
            </h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                {job.company?.name?.[0] || '🏢'}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">{job.company?.name}</h4>
                <p className="text-xs text-slate-500">{job.company?.sector}</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              {job.company?.description}
            </p>
            {job.company?.website && (
              <a
                href={job.company.website}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Visiter le site officiel ↗
              </a>
            )}
          </div>

          {/* LOCALISATION GÉOGRAPHIQUE */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-2 flex items-center">
              <MapPin className="w-4 h-4 mr-1.5 text-rose-500" />
              Lieu de travail
            </h3>
            <p className="text-xs text-slate-700 font-semibold">
              {job.delegation ? `${job.delegation}, ` : ''}
              {job.governorate?.nameFr} ({job.governorate?.nameAr})
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Coordonnées : {job.latitude.toFixed(4)}, {job.longitude.toFixed(4)}
            </p>
            <div className="mt-4">
              <Link
                href={`/carte?gov=${job.governorateCode}`}
                className="block text-center py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition"
              >
                Ouvrir sur la carte de Tunisie 🗺️
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
