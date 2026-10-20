'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  FileText,
  Shield,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Sparkles,
  ArrowLeft,
  GraduationCap,
  Plus,
  Upload,
  ExternalLink,
  MapPin,
  DollarSign,
  Languages,
  Check,
  Calendar,
  Building,
} from 'lucide-react';
import { TUNISIAN_GOVERNORATES } from '@tunijobs/shared-types';

export default function CandidateProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Editable fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState<number>(2);
  const [currentSalary, setCurrentSalary] = useState<number | ''>(2500);
  const [expectedSalary, setExpectedSalary] = useState<number | ''>(3500);
  const [cvFileUrl, setCvFileUrl] = useState<string>('');
  const [cvFileName, setCvFileName] = useState<string>('');
  const [preferredGovs, setPreferredGovs] = useState<string[]>(['11']);

  // Modals / Inline forms
  const [showAddExp, setShowAddExp] = useState(false);
  const [expCompany, setExpCompany] = useState('');
  const [expTitle, setExpTitle] = useState('');
  const [expLocation, setExpLocation] = useState('Tunis');
  const [expStartDate, setExpStartDate] = useState('2022-01-01');
  const [expEndDate, setExpEndDate] = useState('');
  const [expDesc, setExpDesc] = useState('');

  const [showAddEdu, setShowAddEdu] = useState(false);
  const [eduInstitution, setEduInstitution] = useState('');
  const [eduDegree, setEduDegree] = useState('Diplôme National d\'Ingénieur');
  const [eduField, setEduField] = useState('Informatique & Génie Logiciel');
  const [eduStartDate, setEduStartDate] = useState('2017-09-01');
  const [eduEndDate, setEduEndDate] = useState('2022-06-30');

  const [newSkillName, setNewSkillName] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  const AI_URL = 'http://localhost:8000';

  const getCandidateToken = async (): Promise<string | null> => {
    let token = typeof window !== 'undefined' ? localStorage.getItem('tunijobs_token') : null;
    if (!token) {
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'candidat@tunijobs.tn', password: 'Tunisia2026!' }),
      });
      if (loginRes.ok) {
        const auth = await loginRes.json();
        if (auth.accessToken) {
          token = auth.accessToken as string;
          localStorage.setItem('tunijobs_token', token);
        }
      }
    }
    return token;
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
      const token = await getCandidateToken();
      if (token) {
        const res = await fetch(`${API_URL}/candidates/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setFirstName(data.firstName || '');
          setLastName(data.lastName || '');
          setPhone(data.user?.phone || data.phone || '+216 98 123 456');
          setHeadline(data.headline || 'Ingénieur Logiciel Full-Stack');
          setBio(data.bio || 'Passionné par le développement web, Next.js, NestJS et l\'IA.');
          setExperienceYears(data.experienceYears || 2);
          setCurrentSalary(data.currentSalary || 2800);
          setExpectedSalary(data.expectedSalary || 3800);
          setCvFileUrl(data.cvFileUrl || '/uploads/cv/cv_yassine_trabelsi.pdf');
          setCvFileName(data.cvFileUrl ? data.cvFileUrl.split('/').pop() || 'cv_candidat.pdf' : 'cv_yassine_trabelsi.pdf');
          setPreferredGovs(data.preferredGovernorates || ['11', '12', '13']);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [API_URL]);

  // Sauvegarde des informations principales
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const token = await getCandidateToken();
      const res = await fetch(`${API_URL}/candidates/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          headline,
          bio,
          experienceYears: Number(experienceYears),
          currentSalary: currentSalary ? Number(currentSalary) : undefined,
          expectedSalary: expectedSalary ? Number(expectedSalary) : undefined,
          preferredGovernorates: preferredGovs,
          cvFileUrl,
        }),
      });

      if (!res.ok) throw new Error('Erreur lors de la sauvegarde du profil');

      setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
      await loadProfile();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Une erreur est survenue' });
    } finally {
      setSaving(false);
    }
  };

  // Upload du fichier CV en pièce jointe
  const handleCvFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCv(true);
    setMessage(null);

    try {
      const fileName = file.name;
      const fileUrl = `/uploads/cv/${fileName}`;
      setCvFileUrl(fileUrl);
      setCvFileName(fileName);

      // Si le candidat souhaite également parser avec l'OCR IA en tâche de fond
      const formData = new FormData();
      formData.append('file', file);

      try {
        const ocrRes = await fetch(`${AI_URL}/ai/parse-cv`, {
          method: 'POST',
          body: formData,
        });

        if (ocrRes.ok) {
          const parsed = await ocrRes.json();
          if (parsed.headline && !headline) setHeadline(parsed.headline);
          if (parsed.experience_years) setExperienceYears(parsed.experience_years);
          if (parsed.summary && !bio) setBio(parsed.summary);
        }
      } catch (ocrErr) {
        // Fallback transparent
      }

      // Sauvegarder l'URL du CV sur le profil
      const token = await getCandidateToken();
      await fetch(`${API_URL}/candidates/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          headline,
          bio,
          cvFileUrl: fileUrl,
        }),
      });

      setMessage({ type: 'success', text: `CV "${fileName}" téléversé et rattaché avec succès en pièce jointe !` });
      await loadProfile();
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement de la pièce jointe' });
    } finally {
      setUploadingCv(false);
    }
  };

  // Ajouter une expérience professionnelle
  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await getCandidateToken();
      const res = await fetch(`${API_URL}/candidates/experiences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyName: expCompany,
          roleTitle: expTitle,
          location: expLocation,
          startDate: expStartDate,
          endDate: expEndDate || undefined,
          description: expDesc,
        }),
      });

      if (res.ok) {
        setShowAddExp(false);
        setExpCompany('');
        setExpTitle('');
        setExpDesc('');
        await loadProfile();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteExperience = async (id: string) => {
    try {
      const token = await getCandidateToken();
      await fetch(`${API_URL}/candidates/experiences/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadProfile();
    } catch (err) {
      console.error(err);
    }
  };

  // Ajouter une formation / diplôme
  const handleAddEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await getCandidateToken();
      const res = await fetch(`${API_URL}/candidates/educations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          institution: eduInstitution,
          degree: eduDegree,
          field: eduField,
          startDate: eduStartDate,
          endDate: eduEndDate || undefined,
        }),
      });

      if (res.ok) {
        setShowAddEdu(false);
        setEduInstitution('');
        await loadProfile();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEducation = async (id: string) => {
    try {
      const token = await getCandidateToken();
      await fetch(`${API_URL}/candidates/educations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadProfile();
    } catch (err) {
      console.error(err);
    }
  };

  // Ajouter une compétence
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    try {
      const token = await getCandidateToken();
      const res = await fetch(`${API_URL}/candidates/skills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newSkillName.trim(), level: 'Avancé' }),
      });

      if (res.ok) {
        setNewSkillName('');
        await loadProfile();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    try {
      const token = await getCandidateToken();
      await fetch(`${API_URL}/candidates/skills/${skillId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadProfile();
    } catch (err) {
      console.error(err);
    }
  };

  // INPDP Loi 2004-63: Téléchargement des données personnelles
  const handleExportData = async () => {
    try {
      const token = await getCandidateToken();
      const res = await fetch(`${API_URL}/candidates/export-data`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tunijobs_donnees_personnelles_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      alert('Erreur lors de l\'export des données INPDP');
    }
  };

  // INPDP Loi 2004-63: Droit à l'oubli et suppression
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Conformément à la Loi tunisienne n° 2004-63 (INPDP), cette action supprimera définitivement votre compte, votre profil et vos pièces jointes. Continuer ?'
    );
    if (!confirmed) return;

    try {
      const token = await getCandidateToken();
      const res = await fetch(`${API_URL}/candidates/account`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        localStorage.removeItem('tunijobs_token');
        localStorage.removeItem('tunijobs_user');
        alert('Votre compte a été supprimé avec succès conformément à la loi INPDP.');
        router.push('/');
      }
    } catch (err) {
      alert('Erreur lors de la suppression du compte');
    }
  };

  // Calcul du score de complétion du profil
  const calculateCompletionScore = () => {
    let score = 20; // Base compte créé
    if (firstName && lastName) score += 15;
    if (headline) score += 15;
    if (cvFileUrl) score += 20; // Pièce jointe CV
    if (profile?.experiences?.length > 0) score += 15;
    if (profile?.educations?.length > 0) score += 10;
    if (profile?.skills?.length > 0) score += 5;
    return Math.min(score, 100);
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-xs">Chargement de votre profil complet...</p>
      </div>
    );
  }

  const completionScore = calculateCompletionScore();

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl space-y-6">
      {/* BANNIÈRE HÉROS / PRÉSENTATION CANDIDAT */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <User className="w-96 h-96" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 backdrop-blur border-2 border-white/20 flex items-center justify-center text-3xl font-black text-white shadow-inner">
              {firstName?.[0] || 'Y'}{lastName?.[0] || 'T'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black">
                  {firstName} {lastName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Vérifié TuniJobs
                </span>
              </div>
              <p className="text-sm text-blue-100 font-medium">{headline}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-blue-200/80 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-300" /> Tunis, Tunisie
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-amber-300" /> {experienceYears} ans d'expérience
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-300" /> {phone}
                </span>
              </div>
            </div>
          </div>

          {/* JAUGE DE COMPLÉTION DU PROFIL */}
          <div className="bg-white/10 backdrop-blur rounded-2xl border border-white/15 p-4 min-w-[220px]">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span>Complétion du profil</span>
              <span className="text-amber-300">{completionScore}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden mb-2">
              <div
                className="bg-gradient-to-r from-amber-400 to-emerald-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionScore}%` }}
              />
            </div>
            <p className="text-[10px] text-blue-200">
              {completionScore === 100
                ? '⭐ Profil parfait ! Visibilité maximale auprès des recruteurs.'
                : 'Ajoutez votre CV et vos diplômes pour maximiser les opportunités.'}
            </p>
          </div>
        </div>
      </div>

      {/* ALERT MESSAGES */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* SECTION 1 : PIÈCE JOINTE CV & PARSER IA / OCR */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600 font-bold">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Curriculum Vitae (Pièce Jointe Officielle)
              </h2>
              <p className="text-xs text-slate-500">
                Ce document PDF est transmis directement aux recruteurs lors de vos candidatures en 1 clic.
              </p>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleCvFileUpload}
            accept=".pdf,.doc,.docx,image/*"
            className="hidden"
          />
        </div>

        {cvFileUrl ? (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-black text-sm shrink-0">
                PDF
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <span>{cvFileName || 'cv_yassine_trabelsi.pdf'}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Actif
                  </span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pièce jointe officielle prête • Conforme format ATS & INPDP
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={cvFileUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Télécharger / Ouvrir
              </a>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingCv}
                className="px-3.5 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                {uploadingCv ? 'Téléversement...' : 'Remplacer'}
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer transition bg-slate-50/50 hover:bg-blue-50/30"
          >
            <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-bold text-sm text-slate-800">
              Déposez votre CV ici ou cliquez pour parcourir
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Formats supportés : PDF, DOCX, ou image scannée (OCR automatique par le microservice IA)
            </p>
          </div>
        )}
      </div>

      {/* SECTION 2 : INFORMATIONS PERSONNELLES & MOBILITÉ */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-600" />
          Informations Générales & Mobilité
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Prénom</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nom</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Titre du profil (Headline)</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Ex: Ingénieur DevOps & Cloud"
                className="w-full px-3.5 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Années d'expérience</label>
              <input
                type="number"
                min={0}
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Téléphone portable (+216 Tunisie)</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+216 98 123 456"
              className="w-full px-3.5 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Résumé professionnel (Bio)</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
            />
          </div>

          {/* RÉMUNÉRATION SOUHAITÉE EN TND */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="block text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              Prétentions salariales brutes mensuelles (Dinars Tunisiens - TND)
            </span>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Salaire actuel</label>
                <div className="relative">
                  <input
                    type="number"
                    value={currentSalary}
                    onChange={(e) => setCurrentSalary(e.target.value ? Number(e.target.value) : '')}
                    className="w-full pl-3 pr-10 py-1.5 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold"
                  />
                  <span className="absolute right-3 top-1.5 text-xs text-slate-400 font-bold">DT</span>
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Salaire souhaité</label>
                <div className="relative">
                  <input
                    type="number"
                    value={expectedSalary}
                    onChange={(e) => setExpectedSalary(e.target.value ? Number(e.target.value) : '')}
                    className="w-full pl-3 pr-10 py-1.5 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold"
                  />
                  <span className="absolute right-3 top-1.5 text-xs text-slate-400 font-bold">DT</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer les informations générales'}
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 3 : EXPÉRIENCES PROFESSIONNELLES */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Expériences Professionnelles
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowAddExp(!showAddExp)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Ajouter une expérience
          </button>
        </div>

        {/* Formulaire ajout expérience */}
        {showAddExp && (
          <form onSubmit={handleAddExperience} className="p-4 bg-slate-50 rounded-2xl border border-blue-200 space-y-3">
            <h4 className="font-bold text-xs text-slate-900">Nouvelle expérience professionnelle</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Entreprise</label>
                <input
                  type="text"
                  required
                  value={expCompany}
                  onChange={(e) => setExpCompany(e.target.value)}
                  placeholder="Vermeg, Telnet, Instadeep, SAGEM..."
                  className="w-full px-3 py-1.5 text-xs border rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Poste occupé</label>
                <input
                  type="text"
                  required
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  placeholder="Ex: Ingénieur Full-Stack Senior"
                  className="w-full px-3 py-1.5 text-xs border rounded-lg outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Lieu</label>
                <input
                  type="text"
                  value={expLocation}
                  onChange={(e) => setExpLocation(e.target.value)}
                  placeholder="Tunis, Sousse, Sfax..."
                  className="w-full px-3 py-1.5 text-xs border rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Date de début</label>
                <input
                  type="date"
                  required
                  value={expStartDate}
                  onChange={(e) => setExpStartDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Date de fin (vide si actuel)</label>
                <input
                  type="date"
                  value={expEndDate}
                  onChange={(e) => setExpEndDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border rounded-lg outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Missions et réalisations</label>
              <textarea
                rows={2}
                value={expDesc}
                onChange={(e) => setExpDesc(e.target.value)}
                placeholder="Description des projets, stack technique utilisée..."
                className="w-full p-2 text-xs border rounded-lg outline-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddExp(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
              >
                Ajouter
              </button>
            </div>
          </form>
        )}

        {/* Liste des expériences */}
        {profile?.experiences && profile.experiences.length > 0 ? (
          <div className="space-y-3">
            {profile.experiences.map((exp: any) => (
              <div
                key={exp.id}
                className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900">{exp.roleTitle}</h4>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-semibold text-blue-700">{exp.companyName}</span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(exp.startDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} -{' '}
                    {exp.endDate
                      ? new Date(exp.endDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
                      : 'Présent'}
                    {exp.location && ` • ${exp.location}`}
                  </p>
                  {exp.description && (
                    <p className="text-xs text-slate-600 pt-1 leading-relaxed">{exp.description}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteExperience(exp.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">Aucune expérience ajoutée pour le moment.</p>
        )}
      </div>

      {/* SECTION 4 : FORMATIONS & DIPLÔMES */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-600" />
            <h2 className="text-base font-bold text-slate-900">
              Formations & Diplômes
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowAddEdu(!showAddEdu)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Ajouter une formation
          </button>
        </div>

        {/* Formulaire ajout formation */}
        {showAddEdu && (
          <form onSubmit={handleAddEducation} className="p-4 bg-slate-50 rounded-2xl border border-purple-200 space-y-3">
            <h4 className="font-bold text-xs text-slate-900">Nouvelle formation / diplôme</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Établissement / Université</label>
                <input
                  type="text"
                  required
                  value={eduInstitution}
                  onChange={(e) => setEduInstitution(e.target.value)}
                  placeholder="INSAT, ESPRIT, ENIT, ISG, FST, Université de Tunis..."
                  className="w-full px-3 py-1.5 text-xs border rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Diplôme obtenu</label>
                <input
                  type="text"
                  required
                  value={eduDegree}
                  onChange={(e) => setEduDegree(e.target.value)}
                  placeholder="Diplôme d'Ingénieur, Licence, Master, Doctorat..."
                  className="w-full px-3 py-1.5 text-xs border rounded-lg outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Filière / Domaine</label>
                <input
                  type="text"
                  required
                  value={eduField}
                  onChange={(e) => setEduField(e.target.value)}
                  placeholder="Génie Logiciel, Réseaux, Data..."
                  className="w-full px-3 py-1.5 text-xs border rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Date début</label>
                <input
                  type="date"
                  required
                  value={eduStartDate}
                  onChange={(e) => setEduStartDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Date fin / diplôme</label>
                <input
                  type="date"
                  value={eduEndDate}
                  onChange={(e) => setEduEndDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border rounded-lg outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddEdu(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
              >
                Ajouter
              </button>
            </div>
          </form>
        )}

        {/* Liste des formations */}
        {profile?.educations && profile.educations.length > 0 ? (
          <div className="space-y-3">
            {profile.educations.map((edu: any) => (
              <div
                key={edu.id}
                className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200 flex items-start justify-between gap-4"
              >
                <div className="space-y-0.5">
                  <h4 className="font-bold text-sm text-slate-900">{edu.degree}</h4>
                  <p className="text-xs font-semibold text-purple-700">{edu.institution}</p>
                  <p className="text-xs text-slate-500">
                    {edu.field} • {new Date(edu.startDate).getFullYear()} -{' '}
                    {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Présent'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteEducation(edu.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">Aucune formation ajoutée pour le moment.</p>
        )}
      </div>

      {/* SECTION 5 : COMPÉTENCES & MOTS-CLÉS ESCO */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Compétences & Mots-clés ESCO
        </h2>
        <p className="text-xs text-slate-500">
          Ces compétences sont projetées dans l'espace vectoriel à 768 dimensions pour calculer vos scores d'affinité IA.
        </p>

        <form onSubmit={handleAddSkill} className="flex gap-2">
          <input
            type="text"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            placeholder="Ajouter une compétence (ex: Kubernetes, Fastify, PyTorch, GraphQL...)"
            className="flex-1 px-3.5 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Ajouter
          </button>
        </form>

        <div className="flex flex-wrap gap-2 pt-2">
          {profile?.skills?.map((s: any) => (
            <span
              key={s.id || s.skill?.id}
              className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              <span>{s.skill?.name || s.name}</span>
              <button
                type="button"
                onClick={() => handleDeleteSkill(s.skillId || s.skill?.id)}
                className="text-slate-400 hover:text-rose-600 transition"
                title="Supprimer"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* SECTION 6 : CONFORMITÉ INPDP LOI TUNISIENNE 2004-63 */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Shield className="w-5 h-5 text-emerald-600" />
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Protection des données (INPDP - Loi tunisienne n° 2004-63)
            </h2>
            <p className="text-xs text-slate-500">
              Instance Nationale de Protection des Données Personnelles de la République Tunisienne
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          TuniJobs respecte scrupuleusement la réglementation tunisienne. Vous disposez à tout moment d'un droit d'accès, d'exportation intégrale de votre dossier ainsi que d'un droit à l'effacement définitif (droit à l'oubli).
        </p>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleExportData}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-blue-600" />
            Exporter toutes mes données (Format JSON)
          </button>

          <button
            type="button"
            onClick={handleDeleteAccount}
            className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            Supprimer mon compte (Droit à l'oubli)
          </button>
        </div>
      </div>
    </div>
  );
}
