from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List, Dict, Any
from app.services.llm_service import generate_job_description

router = APIRouter(prefix="/ai", tags=["Assistants IA"])

class GenerateJobRequest(BaseModel):
    keywords: List[str] = Field(..., description="Compétences et mots-clés du poste (ex: Flutter, Sousse, Senior)")
    governorate: str = Field("Tunis", description="Lieu de travail prévu")

class ImproveCvRequest(BaseModel):
    cv_skills: List[str]
    target_job_title: str
    target_job_skills: List[str]

@router.post("/generate-job")
async def generate_job_offer(request: GenerateJobRequest):
    """
    Assistant pour les recruteurs : génère un titre, une description et les prérequis d'une offre à partir de mots-clés.
    """
    return generate_job_description(request.keywords, request.governorate)

@router.post("/improve-cv")
async def improve_cv(request: ImproveCvRequest):
    """
    Assistant candidat : suggère les compétences manquantes et axes d'amélioration pour viser un poste donné.
    """
    missing = [s for s in request.target_job_skills if s.lower() not in [cs.lower() for cs in request.cv_skills]]
    return {
        "target_job": request.target_job_title,
        "missing_skills": missing,
        "recommendations": [
            f"Ajoutez des projets concrets démontrant votre maîtrise de : {', '.join(missing[:3])}." if missing else "Votre profil couvre l'ensemble des compétences techniques demandées !",
            "Structurez vos réalisations avec des métriques chiffrées (ex: réduction des temps de latence de 30%).",
            "Mettez en avant vos diplômes ou certifications délivrés par des institutions tunisiennes ou internationales.",
        ],
    }
