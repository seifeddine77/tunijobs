'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Building2,
  Users,
  Briefcase,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  History,
  Search,
  ExternalLink,
  MapPin,
  Sparkles,
  AlertTriangle,
  Globe,
} from 'lucide-react';
import { TUNISIAN_GOVERNORATES } from '@tunijobs/shared-types';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [pendingCompanies, setPendingCompanies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminToken, setAdminToken] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'COMPANIES' | 'USERS' | 'AUDIT'>('OVERVIEW');
  const [scraping, setScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<{ count: number; message: string } | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  const loadAdminData = async (token: string) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, pendingRes, usersRes, logsRes] = await Promise.all([
        fetch(`${API_URL}/admin/stats/overview`, { headers }),
        fetch(`${API_URL}/admin/companies/pending`, { headers }),
        fetch(`${API_URL}/admin/users`, { headers }),
        fetch(`${API_URL}/admin/audit-logs`, { headers }),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (pendingRes.ok) setPendingCompanies(await pendingRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (logsRes.ok) setAuditLogs(await logsRes.json());
    } catch (err) {
      console.error('Erreur chargement données admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        // Authentification automatique compte démo Administrateur
        const loginRes = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@tunijobs.tn', password: 'Tunisia2026!' }),
        });

        if (loginRes.ok) {
          const auth = await loginRes.json();
          setAdminToken(auth.accessToken);
          loadAdminData(auth.accessToken);
        } else {
          setLoading(false);
        }
      } catch (e) {
        setLoading(false);
      }
    }
    init();
  }, [API_URL]);

  // Validation ou Rejet d'une entreprise
  const handleReviewCompany = async (companyId: string, status: 'APPROVED' | 'REJECTED') => {
    const reason = status === 'APPROVED' ? 'Matricule fiscal validé RNE' : 'Matricule fiscal ou statut non conforme';
    try {
      const res = await fetch(`${API_URL}/admin/companies/${companyId}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status, reason }),
      });

      if (res.ok) {
        await loadAdminData(adminToken);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Collecte automatisée d'offres d'emploi Web (Scraper)
  const handleRunScraper = async () => {
    setScraping(true);
    setScrapeResult(null);
    try {
      const res = await fetch(`${API_URL}/admin/scraper/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ count: 4 }),
      });

      if (!res.ok) {
        throw new Error('Erreur lors de la collecte d\'offres');
      }

      const data = await res.json();
      setScrapeResult({
        count: data.importedCount,
        message: `${data.importedCount} offres collectées et insérées avec succès dans la base PostgreSQL !`,
      });
      await loadAdminData(adminToken);
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la collecte');
    } finally {
      setScraping(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm">Chargement du portail d'administration...</p>
      </div>
    );
  }

  const overview = stats?.overview || {};

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-6xl">
      {/* HEADER DASHBOARD */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-slate-900 text-white font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Tableau de bord Administrateur
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Modération des entreprises (RNE), surveillance des offres et statistiques nationales des 24 gouvernorats.
          </p>
        </div>

        {/* ONGLETS DE NAVIGATION */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'OVERVIEW'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Vue générale
          </button>
          <button
            onClick={() => setActiveTab('COMPANIES')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'COMPANIES'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Entreprises ({pendingCompanies.length})
          </button>
          <button
            onClick={() => setActiveTab('USERS')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'USERS'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Utilisateurs
          </button>
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'AUDIT'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Journal d'audit
          </button>
        </div>
      </div>

      {/* 4 CARTES KPI STATISTIQUES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Entreprises en attente
            </span>
            <Building2 className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {overview.pendingCompanies ?? 0}
          </div>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">
            À vérifier avec le RNE
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Offres Actives
            </span>
            <Briefcase className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {overview.activeOffers ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Sur les 24 gouvernorats
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Candidats Inscrits
            </span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {overview.totalCandidates ?? 0}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            Consentement RGPD/INPDP validé
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Candidatures Déposées
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {overview.totalApplications ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Moy. {overview.averageApplicationsPerOffer} / offre
          </p>
        </div>
      </div>

      {/* CONTENU ONGLET 1 : VUE GÉNÉRALE & STATS RÉGIONALES */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* RÉPARTITION GÉOGRAPHIQUE */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                Répartition des offres par gouvernorat
              </h3>
              <Link href="/carte" className="text-xs font-bold text-blue-600 hover:underline">
                Voir sur la carte ↗
              </Link>
            </div>

            <div className="space-y-3 pt-2">
              {TUNISIAN_GOVERNORATES.slice(0, 8).map((gov) => {
                const found = stats?.offersByGovernorate?.find((g: any) => g.governorateCode === gov.code);
                const count = found ? found.count : 0;
                const percentage = overview.activeOffers > 0 ? (count / overview.activeOffers) * 100 : 0;

                return (
                  <div key={gov.code}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700">
                        {gov.nameFr} ({gov.nameAr})
                      </span>
                      <span className="font-bold text-slate-900">
                        {count} offre{count > 1 ? 's' : ''} ({Math.round(percentage)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 3)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TOP COMPÉTENCES & ACTIONS RAPIDES */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Compétences les plus demandées en Tunisie
              </h3>
              <div className="space-y-2.5">
                {stats?.topSkills && stats.topSkills.length > 0 ? (
                  stats.topSkills.map((skill: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                    >
                      <span className="font-bold text-slate-800">
                        #{i + 1} {skill.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-extrabold text-[11px]">
                        {skill.count} offre(s)
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">Aucune donnée de compétences pour l'instant</p>
                )}
              </div>
            </div>

            {/* COLLECTE AUTOMATIQUE WEB (SCRAPER IA) */}
            <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white p-6 rounded-2xl shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-blue-600/30 border border-blue-400/30 text-blue-400">
                    <Globe className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-white">
                      Collecteur d'Offres Web (Keejob / Tanitjobs)
                    </h4>
                    <p className="text-[11px] text-slate-300">
                      Scraping automatisé et géocodage sur les 24 gouvernorats
                    </p>
                  </div>
                </div>
              </div>

              {scrapeResult && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{scrapeResult.message}</span>
                </div>
              )}

              <p className="text-xs text-slate-300 leading-relaxed">
                Ce robot extrait les offres récentes, analyse les types de contrats tunisiens (SIVP, Karama, CDI), extrait les compétences ESCO et géoréférence chaque poste.
              </p>

              <button
                type="button"
                onClick={handleRunScraper}
                disabled={scraping}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
              >
                {scraping ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Collecte et géoréférencement en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    Lancer la collecte automatique d'offres web
                  </>
                )}
              </button>
            </div>

            {/* ALERTE MODÉRATION */}
            {pendingCompanies.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-amber-900">
                    {pendingCompanies.length} entreprise(s) en attente d'approbation
                  </h4>
                  <p className="text-[11px] text-amber-700 mt-1">
                    Vérifiez le matricule fiscal tunisien auprès du Registre National des Entreprises (RNE).
                  </p>
                  <button
                    onClick={() => setActiveTab('COMPANIES')}
                    className="mt-2 text-xs font-bold text-amber-900 hover:underline"
                  >
                    Examiner les dossiers →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONTENU ONGLET 2 : ENTREPRISES EN ATTENTE DE VALIDATION */}
      {activeTab === 'COMPANIES' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Validation des comptes entreprises (Conformité RNE)
              </h3>
              <p className="text-xs text-slate-500">
                Seules les entreprises validées par l'administrateur peuvent publier des offres visibles par les candidats.
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-full">
              {pendingCompanies.length} en attente
            </span>
          </div>

          {pendingCompanies.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-slate-800 text-sm">Toutes les entreprises sont à jour !</p>
              <p className="text-xs text-slate-500 mt-0.5">Aucun dossier en attente de modération.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b text-slate-400 font-semibold">
                    <th className="py-3 px-2">Entreprise</th>
                    <th className="py-3 px-2">Matricule Fiscal (TN)</th>
                    <th className="py-3 px-2">Secteur / Taille</th>
                    <th className="py-3 px-2">Contact</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingCompanies.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-2 font-bold text-slate-900">
                        {c.name}
                      </td>
                      <td className="py-3 px-2 font-mono font-bold text-blue-700">
                        {c.taxId}
                      </td>
                      <td className="py-3 px-2 text-slate-600">
                        {c.sector} · {c.size}
                      </td>
                      <td className="py-3 px-2 text-slate-500">
                        {c.user?.email}<br />
                        {c.user?.phone}
                      </td>
                      <td className="py-3 px-2 text-right space-x-2">
                        <button
                          onClick={() => handleReviewCompany(c.id, 'APPROVED')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition"
                        >
                          Valider ✓
                        </button>
                        <button
                          onClick={() => handleReviewCompany(c.id, 'REJECTED')}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-xs transition"
                        >
                          Rejeter ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CONTENU ONGLET 3 : UTILISATEURS */}
      {activeTab === 'USERS' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b">
            <h3 className="font-bold text-slate-900 text-base">
              Gestion des comptes utilisateurs ({users.length})
            </h3>
            <span className="text-xs text-slate-400">Candidats & Recruteurs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b text-slate-400 font-semibold">
                  <th className="py-3 px-2">Utilisateur</th>
                  <th className="py-3 px-2">Rôle</th>
                  <th className="py-3 px-2">Profil / Entreprise</th>
                  <th className="py-3 px-2">Consentement Loi 2004-63</th>
                  <th className="py-3 px-2">Date inscription</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-2">
                      <div className="font-bold text-slate-900">{u.email}</div>
                      <div className="text-[11px] text-slate-500">{u.phone || 'Non renseigné'}</div>
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'RECRUITER'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-slate-700 font-medium">
                      {u.candidate
                        ? `${u.candidate.firstName} ${u.candidate.lastName}`
                        : u.company?.name || '—'}
                    </td>
                    <td className="py-3 px-2 text-emerald-600 font-bold">
                      {u.consentGdprAt ? '✓ Validé' : 'En attente'}
                    </td>
                    <td className="py-3 px-2 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString('fr-TN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTENU ONGLET 4 : JOURNAL D'AUDIT DE SÉCURITÉ */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <History className="w-4 h-4 text-slate-500" />
                Journal d'audit des actions sensibles
              </h3>
              <p className="text-xs text-slate-500">
                Traçabilité administrative immuable (validation, modération, changements de statuts).
              </p>
            </div>
            <span className="text-xs text-slate-400">{auditLogs.length} événements récents</span>
          </div>

          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white">
                      {log.action}
                    </span>
                    <span className="font-bold text-slate-800">{log.resource}</span>
                  </div>
                  <p className="text-slate-600 mt-1">
                    Par : <span className="font-semibold">{log.user?.email || 'Système'}</span> · Motif : {log.details?.reason || 'Action administrative'}
                  </p>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  {new Date(log.createdAt).toLocaleString('fr-TN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
