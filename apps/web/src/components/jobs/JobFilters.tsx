'use client';

import React from 'react';
import { Search, MapPin, Briefcase, DollarSign, RotateCcw, Building } from 'lucide-react';
import { TUNISIAN_GOVERNORATES, ContractType, WorkMode } from '@tunijobs/shared-types';

export interface FilterState {
  q: string;
  governorate: string;
  contractType: string;
  workMode: string;
  minSalary: number;
}

interface JobFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
}

export function JobFilters({ filters, onChange, onReset }: JobFiltersProps) {
  const handleChange = (field: keyof FilterState, value: any) => {
    onChange({
      ...filters,
      [field]: value,
    });
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b">
        <h3 className="font-bold text-slate-900 text-sm flex items-center">
          <Search className="w-4 h-4 mr-2 text-blue-600" />
          Filtres de recherche
        </h3>
        <button
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 font-medium transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Réinitialiser
        </button>
      </div>

      {/* Recherche textuelle */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Mots-clés / Métier
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.q}
            onChange={(e) => handleChange('q', e.target.value)}
            placeholder="ex: React, NestJS, DevOps..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Gouvernorat (24 régions) */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Gouvernorat (Tunisie)
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-rose-500" />
          <select
            value={filters.governorate}
            onChange={(e) => handleChange('governorate', e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          >
            <option value="">Tous les gouvernorats (24)</option>
            {TUNISIAN_GOVERNORATES.map((gov) => (
              <option key={gov.code} value={gov.code}>
                {gov.nameFr} ({gov.nameAr})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Type de contrat (CDI, CDD, SIVP, KARAMA...) */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Type de contrat
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { value: '', label: 'Tous' },
            { value: ContractType.CDI, label: 'CDI' },
            { value: ContractType.SIVP, label: 'SIVP' },
            { value: ContractType.CDD, label: 'CDD' },
            { value: ContractType.KARAMA, label: 'Karama' },
            { value: ContractType.FREELANCE, label: 'Freelance' },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => handleChange('contractType', item.value)}
              className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg border text-center transition ${
                filters.contractType === item.value
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mode de travail */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Mode de travail
        </label>
        <div className="grid grid-cols-3 gap-1">
          {[
            { value: '', label: 'Tous' },
            { value: WorkMode.HYBRID, label: 'Hybride' },
            { value: WorkMode.REMOTE, label: 'Télétravail' },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => handleChange('workMode', item.value)}
              className={`py-1 px-1.5 text-[10px] font-semibold rounded-lg border text-center transition ${
                filters.workMode === item.value
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Salaire minimum en TND */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-xs font-semibold text-slate-700">
            Salaire minimum
          </label>
          <span className="text-xs font-bold text-blue-600">
            {filters.minSalary > 0 ? `${filters.minSalary} TND` : 'Non précisé'}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="5000"
          step="250"
          value={filters.minSalary}
          onChange={(e) => handleChange('minSalary', Number(e.target.value))}
          className="w-full accent-blue-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>0 TND</span>
          <span>2 500 TND</span>
          <span>5 000+ TND</span>
        </div>
      </div>
    </div>
  );
}
