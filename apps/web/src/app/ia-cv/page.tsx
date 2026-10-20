'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ShieldCheck,
  ArrowRight,
  User,
  GraduationCap,
  Briefcase,
  Layers,
} from 'lucide-react';

const SAMPLE_CV_TEXT = `Mohamed Ben Ali
Email: mohamed.benali@gmail.com
Téléphone: +216 98 123 456
Ville: Tunis, Tunisie

Ingénieur Logiciel Full-Stack passionné avec 3 ans d'expérience.
Diplômé de l'INSAT (Institut National des Sciences Appliquées et de Technologie) en 2022.

Compétences techniques :
TypeScript, React, NestJS, Node.js, PostgreSQL, Docker, Git, Tailwind CSS, REST APIs.

Expériences professionnelles :
- Développeur Full-Stack chez Vermeg Tunisie (2022 - 2024)
Conception et maintenance d'architectures microservices, déploiement conteneurisé.

Langues : Français, Arabe (bilingue), Anglais technique.`;

export default function IACVDiagnosticPage() {
  const [cvText, setCvText] = useState(SAMPLE_CV_TEXT);
  const [consent, setConsent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [matchResults, setMatchResults] = useState<any[]>([]);

  const AI_URL = 'http://localhost:8000';
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  const handleAnalyze = async () => {
    if (!consent) {
      alert('Veuillez accepter le traitement IA conformément à la loi tunisienne n° 2004-63.');
      return;
    }
    if (!cvText.trim()) {
      alert('Veuillez coller le contenu de votre CV.');
      return;
    }

    setLoading(true);
    setResult(null);
    setMatchResults([]);

    try {
      // 1. Parsing du CV via FastAPI
      const parseRes = await fetch(`${AI_URL}/ai/parse-cv-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_text: cvText }),
      });

      if (!parseRes.ok) throw new Error('Erreur lors du parsing IA du CV');
      const parsedData = await parseRes.json();
      setResult(parsedData);

      // 2. Récupérer les offres actives pour calculer les scores de matching en direct
      const jobsRes = await fetch(`${API_URL}/jobs`);
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        const activeJobs = jobsData.items || [];

        // Évaluer le matching pour chaque offre
        const matches = await Promise.all(
          activeJobs.slice(0, 3).map(async (job: any) => {
            try {
              const matchReq = {
                candidate: {
                  headline: parsedData.headline,
                  experience_years: parsedData.experience_years,
                  skills: parsedData.skills,
                  preferred_governorates: ['11', '12', '51', '61'],
                  summary: parsedData.summary,
                },
                job: {
                  title: job.title,
                  description: job.description,
                  requirements: job.requirements,
                  skills: job.skills.map((s: any) => s.skill?.name || s),
                  contract_type: job.contractType,
                  work_mode: job.workMode,
                  governorate_code: job.governorateCode,
                  min_experience_years: 2,
                },
              };

              const matchRes = await fetch(`${AI_URL}/ai/match`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(matchReq),
              });

              if (matchRes.ok) {
                const matchData = await matchRes.json();
                return { job, match: matchData };
              }
            } catch (e) {
              return null;
            }
          }),
        );

        setMatchResults(matches.filter(Boolean));
      }
    } catch (err: any) {
      alert(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-5xl">
      {/* HEADER HERO */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          Intelligence Artificielle & Recommandations TuniJobs
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
          Diagnostic IA de votre CV & Matching Prédictif
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600">
          Extraction instantanée des compétences normalisées ESCO, détection des points forts et matching éthique non-discriminant avec les offres en Tunisie.
        </p>
      </div>

      {/* ZONE DE SAISIE / UPLOAD CV */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            Contenu de votre CV à analyser
          </h3>
          <span className="text-xs text-slate-400">Français · Arabe · Anglais</span>
        </div>

        <div>
          <textarea
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            rows={10}
            className="w-full p-4 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition leading-relaxed"
            placeholder="Collez ici le texte complet de votre CV..."
          />
        </div>

        {/* CONSENTEMENT LÉGAL LOI 2004-63 */}
        <div className="flex items-start gap-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
          <input
            type="checkbox"
            id="gdpr"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 h-4 w-4 shrink-0"
          />
          <label htmlFor="gdpr" className="leading-snug">
            <b>Consentement éclairé (INPDP) :</b> J'accepte que mon profil soit analysé par l'algorithme d'aide à la décision TuniJobs conformément à la loi tunisienne n° 2004-63. Le scoring exclut strictement tout critère de genre, âge ou origine.
          </label>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            {loading ? 'Analyse en cours par l\'IA...' : 'Lancer le diagnostic IA'}
          </button>
        </div>
      </div>

      {/* RÉSULTATS DU DIAGNOSTIC IA */}
      {result && (
        <div className="mt-10 space-y-8 animate-in fade-in duration-300">
          {/* CARTE 1 : EXTRACTION STRUCTURÉE */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Étape 1 · Extraction structurée
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                  Profil professionnel identifié
                </h3>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                Format validé ✓
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 mb-1">
                  <User className="w-3.5 h-3.5 text-blue-600" /> Identité & Coordonnées
                </span>
                <p className="font-bold text-slate-900 text-sm">
                  {result.personal_info.first_name} {result.personal_info.last_name}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">{result.personal_info.email}</p>
                <p className="text-xs text-slate-600">{result.personal_info.phone}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 mb-1">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-600" /> Poste & Expérience
                </span>
                <p className="font-bold text-slate-900 text-sm">{result.headline}</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  <b>{result.experience_years} ans</b> d'expérience détectés
                </p>
                <p className="text-xs text-slate-500">Localisation : {result.personal_info.city || 'Tunisie'}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 mb-1">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-600" /> Formation
                </span>
                {result.educations && result.educations.length > 0 ? (
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{result.educations[0].institution}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{result.educations[0].degree}</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Formation universitaire</p>
                )}
              </div>
            </div>

            {/* COMPÉTENCES NORMALISÉES ESCO */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                Compétences normalisées vers la taxonomie ESCO :
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {result.skills.map((skill: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* CARTE 2 : RECOMMANDATIONS & MATCHING HYBRIDE */}
          {matchResults.length > 0 && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Étape 2 · Recommandations personnalisées
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                  Offres hautement compatibles avec votre profil
                </h3>
              </div>

              <div className="space-y-4">
                {matchResults.map(({ job, match }: any) => (
                  <div
                    key={job.id}
                    className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-blue-400 hover:bg-white transition space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                            {job.contractType}
                          </span>
                          <span className="text-xs text-slate-500">
                            {job.company?.name} · {job.governorate?.nameFr}
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 leading-snug">
                          {job.title}
                        </h4>
                      </div>

                      {/* SCORE BADGE */}
                      <div className="shrink-0 sm:text-right">
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-xl font-black text-sm shadow">
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          {match.score}% de Match
                        </div>
                      </div>
                    </div>

                    {/* EXPLICATION DU SCORE */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                      <p className="font-medium text-slate-800">{match.explanation}</p>
                      {match.missing_skills && match.missing_skills.length > 0 && (
                        <p className="text-amber-800 text-[11px] mt-1.5 flex items-center gap-1">
                          <Lightbulb className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>Compétence conseillée : <b>{match.missing_skills.join(', ')}</b></span>
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end pt-1">
                      <Link
                        href={`/offres/${job.slug}`}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        Consulter l'offre et postuler <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
