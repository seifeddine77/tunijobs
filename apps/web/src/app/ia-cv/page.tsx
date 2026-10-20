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
  Search,
  MessageSquare,
  FileCheck2,
  Scan,
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
  const [activeTab, setActiveTab] = useState<'CV_PARSE' | 'RAG_ASSISTANT'>('CV_PARSE');
  const [cvText, setCvText] = useState(SAMPLE_CV_TEXT);
  const [consent, setConsent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [matchResults, setMatchResults] = useState<any[]>([]);

  // État RAG Assistant
  const [ragQuery, setRagQuery] = useState('');
  const [ragLoading, setRagLoading] = useState(false);
  const [ragResult, setRagResult] = useState<any>(null);

  const AI_URL = 'http://localhost:8000';
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  // 1. Analyse IA du CV en texte brut
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
      const parseRes = await fetch(`${AI_URL}/ai/parse-cv-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_text: cvText }),
      });

      if (!parseRes.ok) throw new Error('Erreur lors du parsing IA du CV');
      const parsedData = await parseRes.json();
      setResult(parsedData);

      // Récupérer les offres actives pour matching en direct
      const jobsRes = await fetch(`${API_URL}/jobs`);
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        const activeJobs = jobsData.items || [];

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
                  governorate_code: job.governorateId || '11',
                  contract_type: job.contractType,
                  min_experience_years: 1,
                  skills: (job.skills || []).map((s: any) => s.skill?.name || s.name || 'Tech'),
                  description: job.description || '',
                  requirements: job.requirements || job.description || 'Compétences techniques requises',
                },
              };

              const mRes = await fetch(`${AI_URL}/ai/match`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(matchReq),
              });

              if (mRes.ok) {
                const matchScore = await mRes.json();
                return { job, match: matchScore };
              }
            } catch (e) {
              return null;
            }
          }),
        );

        setMatchResults(matches.filter(Boolean));
      }
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la communication avec le microservice IA.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Upload de fichier avec détection OCR (PDF scanné ou image)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${AI_URL}/ai/parse-cv`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error("Erreur lors de l'extraction OCR du document");
      const data = await res.json();
      setResult(data);
      if (data.raw_text) setCvText(data.raw_text);
    } catch (err: any) {
      alert(err.message || 'Impossible de lire le document avec le moteur OCR');
    } finally {
      setOcrLoading(false);
    }
  };

  // 3. Exécution d'une requête RAG (Retrieval-Augmented Generation)
  const handleRAGQuery = async (queryText?: string) => {
    const q = queryText || ragQuery;
    if (!q.trim()) return;

    setRagLoading(true);
    setRagResult(null);

    try {
      const res = await fetch(`${AI_URL}/ai/rag/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, top_k: 3 }),
      });

      if (!res.ok) throw new Error('Erreur lors du traitement RAG');
      const data = await res.json();
      setRagResult(data);
    } catch (err: any) {
      alert(err.message || 'Erreur RAG');
    } finally {
      setRagLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-5xl">
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          Intelligence Artificielle & Système RAG TuniJobs
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
          Diagnostic IA de votre CV & Moteur RAG Prédictif
        </h1>
        <p className="mt-3 text-slate-600 text-sm sm:text-base">
          Extraction structurée de compétences avec <b>reconnaissance optique (OCR)</b> et assistant de recherche documentaire augmenté par vecteurs 768d (<b>RAG</b>).
        </p>

        {/* ONGLETS NAVIGATION IA */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold mt-6 shadow-sm">
          <button
            onClick={() => setActiveTab('CV_PARSE')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
              activeTab === 'CV_PARSE'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scan className="w-4 h-4 text-blue-500" />
            Analyseur CV & OCR
          </button>
          <button
            onClick={() => setActiveTab('RAG_ASSISTANT')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
              activeTab === 'RAG_ASSISTANT'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            Assistant RAG Tunisie 🇹🇳
          </button>
        </div>
      </div>

      {/* ONGLET 1 : PARSING CV & OCR */}
      {activeTab === 'CV_PARSE' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Téléverser un CV ou coller le contenu
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Accepte les documents PDF (numériques ou scannés) et images (PNG, JPEG) avec OCR automatique.
              </p>
            </div>

            {/* BOUTON UPLOAD OCR */}
            <label className="cursor-pointer px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 shadow-sm transition flex items-center gap-2 shrink-0">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>{ocrLoading ? 'Traitement OCR...' : 'Importer CV (PDF/Image OCR)'}</span>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.tiff"
                onChange={handleFileUpload}
                className="hidden"
                disabled={ocrLoading}
              />
            </label>
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
              {loading ? "Analyse en cours par l'IA..." : 'Lancer le diagnostic IA'}
            </button>
          </div>
        </div>
      )}

      {/* ONGLET 2 : ASSISTANT RAG (RETRIEVAL-AUGMENTED GENERATION) */}
      {activeTab === 'RAG_ASSISTANT' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="pb-4 border-b">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Interrogez le marché de l'emploi en langage naturel (RAG)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Notre moteur RAG calcule l'embedding de votre question en 768d, extrait les fiches de poste réelles de la base et génère une réponse factuelle avec sources.
            </p>
          </div>

          {/* SUGGESTIONS DE QUESTIONS RAPIDES */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="font-semibold text-slate-500 self-center mr-1">Suggestions :</span>
            {[
              'Quels postes DevOps ou Cloud sont disponibles à Tunis ?',
              'Quelles offres proposent un contrat SIVP pour jeunes diplômés ?',
              'Quelles sont les opportunités à Sfax avec plus de 2000 TND ?',
            ].map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setRagQuery(s);
                  handleRAGQuery(s);
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-lg border border-slate-200 text-slate-700 font-medium transition"
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={ragQuery}
              onChange={(e) => setRagQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRAGQuery()}
              placeholder="Ex: Quelles sont les compétences requises pour un poste senior chez Vermeg ?"
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
            <button
              onClick={() => handleRAGQuery()}
              disabled={ragLoading || !ragQuery.trim()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow transition disabled:opacity-50 flex items-center gap-2"
            >
              {ragLoading ? 'Recherche vectorielle...' : 'Interroger le RAG'}
            </button>
          </div>

          {/* RÉSULTAT RAG */}
          {ragResult && (
            <div className="mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b">
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Réponse synthétisée par RAG (Embeddings 768d + Sources)
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-semibold">
                  {ragResult.sources.length} sources vérifiées
                </span>
              </div>

              <div className="text-sm text-slate-800 whitespace-pre-line leading-relaxed font-sans">
                {ragResult.answer}
              </div>

              {/* SOURCES CITÉES */}
              {ragResult.sources && ragResult.sources.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <h5 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Sources documentaires extraites par similarité cosinus :
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ragResult.sources.map((src: any, i: number) => (
                      <div key={i} className="p-3 bg-white rounded-xl border border-slate-200 text-xs shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900">{src.title}</span>
                          <span className="font-bold text-blue-600 text-[11px]">{src.similarity} match</span>
                        </div>
                        <p className="text-slate-500">{src.company} · {src.governorate}</p>
                        <p className="text-emerald-700 font-bold mt-1">Salaire : {src.salary} ({src.contract})</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* RÉSULTATS DU DIAGNOSTIC IA */}
      {result && activeTab === 'CV_PARSE' && (
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
              <div className="flex items-center gap-2">
                {result.ocr_metadata && (
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold border border-purple-200">
                    OCR Actif ({result.ocr_metadata.extraction_method})
                  </span>
                )}
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                  Format validé ✓
                </span>
              </div>
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
