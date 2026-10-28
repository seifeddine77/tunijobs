import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-slate-900 text-slate-400 py-12">
      <div className="container mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center space-x-2 text-white font-bold text-xl mb-3">
            <span>🇹🇳 TuniJobs</span>
          </div>
          <p className="text-sm leading-relaxed">
            Plateforme nationale tunisienne de recrutement intelligent avec cartographie interactive des 24 gouvernorats et matching prédictif par IA.
          </p>
          <p className="text-xs text-slate-500 mt-4">
            Conforme à la loi tunisienne n° 2004-63 sur la protection des données personnelles (INPDP).
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Candidats</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/offres" className="hover:text-white transition">Offres d'emploi</Link></li>
            <li><Link href="/offres?contractType=SIVP" className="hover:text-white transition">Offres SIVP & Karama</Link></li>
            <li><Link href="/ia-cv" className="hover:text-white transition">Diagnostic CV & Compétences IA</Link></li>
            <li><Link href="/carte" className="hover:text-white transition">Carte des offres par région</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Recruteurs</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/recruteur/offres/nouvelle" className="hover:text-white transition">Publier une offre</Link></li>
            <li><Link href="/recruteur/pipeline" className="hover:text-white transition">Pipeline Kanban & Scoring IA</Link></li>
            <li><Link href="/inscription" className="hover:text-white transition">Inscription Entreprise (RNE)</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Régions clés</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/offres?governorate=11" className="hover:text-white transition">Grand Tunis (Tunis, Ariana, Ben Arous)</Link></li>
            <li><Link href="/offres?governorate=51" className="hover:text-white transition">Sahel (Sousse, Monastir, Mahdia)</Link></li>
            <li><Link href="/offres?governorate=61" className="hover:text-white transition">Sfax & Sud</Link></li>
            <li><Link href="/offres?governorate=23" className="hover:text-white transition">Bizerte & Nord</Link></li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 mt-8 pt-8 border-t border-slate-800 text-xs text-center flex flex-col md:flex-row justify-between items-center text-slate-500">
        <p>© 2026 TuniJobs. Tous droits réservés.</p>
        <p className="mt-2 md:mt-0">Fait avec fierté pour l'emploi en Tunisie 🇹🇳</p>
      </div>
    </footer>
  );
}
