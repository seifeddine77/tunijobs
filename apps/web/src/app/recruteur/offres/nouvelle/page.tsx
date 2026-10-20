'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase,
  MapPin,
  Building2,
  DollarSign,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { TUNISIAN_GOVERNORATES } from '@tunijobs/shared-types';

export default function NewJobOfferPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [contractType, setContractType] = useState('CDI');
  const [workMode, setWorkMode] = useState('HYBRID');
  const [experienceLevel, setExperienceLevel] = useState('Confirmé (2-4 ans)');
  const [governorateCode, setGovernorateCode] = useState('11'); // Tunis par défaut
  const [delegation, setDelegation] = useState('');
  const [salaryMin, setSalaryMin] = useState<number | ''>(2200);
  const [salaryMax, setSalaryMax] = useState<number | ''>(3200);
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [skillsInput, setSkillsInput] = useState('TypeScript, NestJS, React, Docker');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  // Pré-remplissage intelligent avec l'IA TuniJobs
  const handleGenerateWithAi = () => {
    if (!title.trim()) {
      setError('Veuillez saisir un titre de poste d\'abord (ex: Développeur Full-Stack, Ingénieur DevOps, Data Scientist)');
      return;
    }
    setError(null);
    setAiLoading(true);

    setTimeout(() => {
      setDescription(
        `Nous recrutons un ${title} talentueux et passionné pour intégrer notre équipe d'ingénierie en forte croissance en Tunisie.\n\n` +
        `Vos missions principales :\n` +
        `• Concevoir, développer et maintenir des applications robustes et scalables.\n` +
        `• Collaborer étroitement avec les équipes produits, design et QA.\n` +
        `• Participer aux revues de code et respecter les meilleures pratiques d'ingénierie logicielle.\n` +
        `• Veiller aux performances, à la sécurité et à l'expérience utilisateur optimale.`
      );

      setRequirements(
        `• Diplôme d'ingénieur ou équivalent (Bac+5) en Informatique ou Génie Logiciel.\n` +
        `• Maîtrise des technologies web modernes et de l'architecture microservices.\n` +
        `• Solide esprit d'équipe, curiosité technique et rigueur.\n` +
        `• Excellente communication en français et en anglais technique.`
      );

      setAiLoading(false);
    }, 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const gov = TUNISIAN_GOVERNORATES.find((g) => g.code === governorateCode) || TUNISIAN_GOVERNORATES[0];
    const skills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      title,
      contractType,
      workMode,
      experienceLevel,
      governorateCode,
      delegation: delegation.trim() || gov.delegations[0] || 'Centre Urbain',
      latitude: gov.centerLat,
      longitude: gov.centerLng,
      salaryMin: salaryMin ? Number(salaryMin) : undefined,
      salaryMax: salaryMax ? Number(salaryMax) : undefined,
      currency: 'TND',
      description,
      requirements,
      skills,
    };

    try {
      // Récupérer le token recruteur (ou démo vermeg par défaut)
      let token = typeof window !== 'undefined' ? localStorage.getItem('tunijobs_token') : null;
      if (!token) {
        const loginRes = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'rh@vermeg.com', password: 'Tunisia2026!' }),
        });
        if (loginRes.ok) {
          const auth = await loginRes.json();
          token = auth.accessToken;
        }
      }

      const res = await fetch(`${API_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Erreur lors de la publication de l\'offre');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/recruteur/pipeline');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la publication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/recruteur/pipeline"
          className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Retour au Pipeline
        </Link>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
          Espace Recruteur
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
        <div className="pb-6 border-b mb-6">
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-600" />
            Publier une nouvelle offre d'emploi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Diffusez votre opportunité auprès de milliers de talents tunisiens et géolocalisez-la sur la carte nationale.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span><b>Offre publiée avec succès !</b> Redirection vers votre pipeline en cours...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* TITRE ET ASSISTANT IA */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">Titre de l'offre *</label>
              <button
                type="button"
                onClick={handleGenerateWithAi}
                disabled={aiLoading}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {aiLoading ? 'Génération IA...' : 'Rédiger avec l\'IA TuniJobs'}
              </button>
            </div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Développeur Full-Stack NestJS / Next.js, Lead DevOps, Data Engineer..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* CONTRAT ET MODE DE TRAVAIL */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Type de contrat</label>
              <select
                value={contractType}
                onChange={(e) => setContractType(e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="CDI">CDI (Indéterminée)</option>
                <option value="CDD">CDD (Déterminée)</option>
                <option value="SIVP">SIVP (Stage d'Initiation)</option>
                <option value="KARAMA">Contrat Karama</option>
                <option value="STAGE">Stage PFE / Été</option>
                <option value="FREELANCE">Freelance / Mission</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mode de travail</label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="HYBRID">Hybride (Présentiel / Télétravail)</option>
                <option value="ON_SITE">100% Présentiel sur site</option>
                <option value="REMOTE">100% Télétravail (Full Remote)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Niveau d'expérience</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="Débutant / Junior (0-2 ans)">Débutant / Junior (0-2 ans)</option>
                <option value="Confirmé (2-4 ans)">Confirmé (2-4 ans)</option>
                <option value="Sénior (5 ans et plus)">Sénior (5 ans et plus)</option>
                <option value="Lead / Manager">Lead / Manager</option>
              </select>
            </div>
          </div>

          {/* GOUVERNORAT ET LOCALISATION TUNISIE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                Gouvernorat (24 Régions de Tunisie) *
              </label>
              <select
                value={governorateCode}
                onChange={(e) => setGovernorateCode(e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                {TUNISIAN_GOVERNORATES.map((gov) => (
                  <option key={gov.code} value={gov.code}>
                    {gov.code} - {gov.nameFr} ({gov.nameAr})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Délégation / Quartier</label>
              <input
                type="text"
                value={delegation}
                onChange={(e) => setDelegation(e.target.value)}
                placeholder="Ex: Les Berges du Lac 2, Ennasr, Sousse Ville, Sfax Médina..."
                className="w-full px-3 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* SALAIRE EN TND */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              Fourchette de rémunération brute (Dinars Tunisiens - TND / mois)
            </span>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Salaire minimum</label>
                <div className="relative">
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value ? Number(e.target.value) : '')}
                    placeholder="2000"
                    className="w-full pl-3 pr-12 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400 font-bold">DT</span>
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Salaire maximum</label>
                <div className="relative">
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value ? Number(e.target.value) : '')}
                    placeholder="3500"
                    className="w-full pl-3 pr-12 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400 font-bold">DT</span>
                </div>
              </div>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description du poste *</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez les objectifs du rôle, les défis techniques et le quotidien dans l'équipe..."
              className="w-full p-3 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
            />
          </div>

          {/* EXIGENCES ET COMPÉTENCES */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Exigences et profil recherché *</label>
            <textarea
              required
              rows={3}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Diplômes, années d'expérience, maîtrise d'outils et soft skills..."
              className="w-full p-3 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
            />
          </div>

          {/* TAGS COMPÉTENCES */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Compétences clés <span className="text-slate-400 font-normal">(séparées par des virgules)</span>
            </label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="TypeScript, React, Python, PostgreSQL, Docker..."
              className="w-full px-3 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-4 border-t flex justify-end gap-3">
            <Link
              href="/recruteur/pipeline"
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Publier l'offre d'emploi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
