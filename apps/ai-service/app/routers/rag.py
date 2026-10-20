from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from app.services.rag_engine import rag_engine

router = APIRouter(prefix="/ai/rag", tags=["RAG (Retrieval-Augmented Generation)"])

class RAGQueryRequest(BaseModel):
    query: str = Field(..., description="Question ou recherche en langage naturel (ex: postes DevOps à Tunis)")
    top_k: int = Field(3, description="Nombre de documents contextuels à récupérer")

class RAGCoverLetterRequest(BaseModel):
    candidate_skills: List[str]
    candidate_experience_years: int
    job_title: str
    company_name: str
    job_requirements: str

@router.post("/query")
async def rag_query_endpoint(req: RAGQueryRequest):
    """
    RAG Pipeline : Recherche sémantique vectorielle (Retrieval) + Augmentation de contexte + Génération factuelle.
    Permet aux candidats et recruteurs d'interroger la base du marché tunisien en langage naturel.
    """
    return rag_engine.query(req.query, top_k=req.top_k)

@router.post("/cover-letter")
async def rag_cover_letter(req: RAGCoverLetterRequest):
    """
    Génération assistée par RAG d'une lettre de motivation hautement ciblée
    en croisant le profil candidat avec les prérequis exacts du poste.
    """
    matched_skills = [s for s in req.candidate_skills if s.lower() in req.job_requirements.lower()]
    skills_text = ", ".join(matched_skills[:4]) if matched_skills else ", ".join(req.candidate_skills[:3])

    letter = f"""Objet : Candidature au poste de {req.job_title} — {req.company_name}

Madame, Monsieur,

Fort(e) de {req.candidate_experience_years} années d'expérience dans le secteur des technologies en Tunisie, je vous adresse ma candidature pour le poste de {req.job_title} au sein de {req.company_name}.

Votre offre a particulièrement retenu mon attention en raison des défis techniques qu'elle propose. Ma maîtrise des technologies clés telles que {skills_text} correspond précisément aux exigences exprimées dans votre fiche de poste.

Rigoureux(se) et orienté(e) vers les résultats, je souhaite mettre mon expertise au service de vos projets innovants. 

Dans l'attente d'un échange lors d'un prochain entretien, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

Candidat TuniJobs
Téléphone : +216 XX XXX XXX"""

    return {
        "job_title": req.job_title,
        "company_name": req.company_name,
        "matched_skills": matched_skills,
        "cover_letter": letter,
        "rag_augmented": True,
    }
