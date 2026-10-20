from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class JobRequirement(BaseModel):
    title: str
    description: str
    requirements: str
    skills: List[str] = Field(default_factory=list)
    contract_type: Optional[str] = None
    work_mode: Optional[str] = "ON_SITE"
    governorate_code: Optional[str] = None
    min_experience_years: int = 0

class CandidateMatchInput(BaseModel):
    headline: Optional[str] = None
    experience_years: int = 0
    skills: List[str] = Field(default_factory=list)
    preferred_governorates: List[str] = Field(default_factory=list)
    summary: Optional[str] = None

class MatchRequest(BaseModel):
    candidate: CandidateMatchInput
    job: JobRequirement
    # Poids configurables
    skill_weight: float = Field(0.4, ge=0.0, le=1.0)
    semantic_weight: float = Field(0.4, ge=0.0, le=1.0)
    experience_weight: float = Field(0.2, ge=0.0, le=1.0)

class MatchResponse(BaseModel):
    score: float = Field(..., description="Score global de 0 à 100")
    is_eligible: bool = Field(True, description="Indique si les critères durs sont validés")
    unmet_filters: List[str] = Field(default_factory=list, description="Critères bloquants non satisfaits")
    matched_skills: List[str] = Field(default_factory=list, description="Compétences validées")
    missing_skills: List[str] = Field(default_factory=list, description="Compétences recherchées absentes")
    strengths: List[str] = Field(default_factory=list, description="Points forts du candidat")
    explanation: str = Field(..., description="Explication en langage clair et transparent")
    sub_scores: Dict[str, float] = Field(default_factory=dict, description="Détail des sous-scores")
