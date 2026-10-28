'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';
import { TUNISIAN_GOVERNORATES } from '@tunijobs/shared-types';

export function HomeSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [governorate, setGovernorate] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (governorate) params.set('governorate', governorate);

    router.push(`/offres?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="mt-8 p-3 bg-white rounded-2xl shadow-xl border border-slate-200 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-3 text-left"
    >
      <div className="md:col-span-5 flex items-center px-3 py-2 border rounded-xl bg-slate-50 border-slate-200">
        <Search className="w-5 h-5 text-slate-400 mr-2 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Métier, mot-clé (ex: Fullstack, DevOps, Data)"
          className="bg-transparent w-full focus:outline-none text-sm text-slate-800 placeholder-slate-400"
        />
      </div>

      <div className="md:col-span-4 flex items-center px-3 py-2 border rounded-xl bg-slate-50 border-slate-200">
        <MapPin className="w-5 h-5 text-rose-500 mr-2 shrink-0" />
        <select
          value={governorate}
          onChange={(e) => setGovernorate(e.target.value)}
          className="bg-transparent w-full focus:outline-none text-sm text-slate-800"
        >
          <option value="">Tous les gouvernorats (24)</option>
          {TUNISIAN_GOVERNORATES.map((gov) => (
            <option key={gov.code} value={gov.code}>
              {gov.nameFr} ({gov.nameAr})
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-3">
        <button
          type="submit"
          className="w-full h-full min-h-[46px] flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition shadow-md"
        >
          Rechercher
        </button>
      </div>
    </form>
  );
}
