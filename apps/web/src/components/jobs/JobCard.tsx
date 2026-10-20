import React from 'react';
import Link from 'next/link';
import { Building2, MapPin, Sparkles, Navigation, Calendar } from 'lucide-react';
import { formatTND } from '@tunijobs/shared-types';

interface JobCardProps {
  job: any;
  isSelected?: boolean;
  onLocate?: (lat: number, lng: number) => void;
}

export function JobCard({ job, isSelected, onLocate }: JobCardProps) {
  const getContractBadgeColor = (type: string) => {
    switch (type) {
      case 'CDI':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'SIVP':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'KARAMA':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CDD':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div
      className={`p-4 rounded-xl border transition duration-200 bg-white ${
        isSelected
          ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getContractBadgeColor(
                job.contractType,
              )}`}
            >
              {job.contractType}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
              {job.workMode === 'ON_SITE'
                ? 'Présentiel'
                : job.workMode === 'HYBRID'
                ? 'Hybride'
                : 'Télétravail'}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              IA Match 88%
            </span>
          </div>

          <h3 className="font-bold text-slate-900 text-base leading-snug hover:text-blue-600 transition">
            <Link href={`/offres/${job.slug}`}>{job.title}</Link>
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-2">
            <span className="flex items-center font-medium">
              <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
              {job.company?.name || 'Entreprise'}
            </span>
            <span className="flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1 text-rose-500" />
              {job.delegation ? `${job.delegation}, ` : ''}
              {job.governorate?.nameFr || 'Tunisie'}
            </span>
          </div>
        </div>

        {/* Bouton localiser sur la carte */}
        {job.latitude && job.longitude && onLocate && (
          <button
            onClick={() => onLocate(job.latitude, job.longitude)}
            className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 border border-slate-200 transition shrink-0"
            title="Localiser cette offre sur la carte"
          >
            <Navigation className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Compétences requises */}
      {job.skills && job.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {job.skills.slice(0, 4).map((item: any, idx: number) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-slate-50 text-slate-600 rounded text-[10px] font-medium border border-slate-100"
            >
              {item.skill?.name || item}
            </span>
          ))}
          {job.skills.length > 4 && (
            <span className="text-[10px] text-slate-400 self-center">
              +{job.skills.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Rémunération & Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs">
        <div>
          {job.salaryMin ? (
            <span className="font-extrabold text-blue-700 text-sm">
              {job.salaryMin} - {job.salaryMax} {job.currency}
              <span className="font-normal text-[10px] text-slate-500"> / mois</span>
            </span>
          ) : (
            <span className="text-slate-400 font-medium">Salaire selon profil</span>
          )}
        </div>

        <Link
          href={`/offres/${job.slug}`}
          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
        >
          Détails & Postuler →
        </Link>
      </div>
    </div>
  );
}
