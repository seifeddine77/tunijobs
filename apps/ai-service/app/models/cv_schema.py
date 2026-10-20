from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class PersonalInfo(BaseModel):
    first_name: Optional[str] = Field(None, description="Prénom extrait")
    last_name: Optional[str] = Field(None, description="Nom extrait")
    email: Optional[str] = Field(None, description="Adresse email")
    phone: Optional[str] = Field(None, description="Numéro de téléphone tunisien")
    city: Optional[str] = Field(None, description="Gouvernorat ou ville")

class ExperienceItem(BaseModel):
    title: str = Field(..., description="Poste occupé")
    company: Optional[str] = Field(None, description="Entreprise")
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None

class EducationItem(BaseModel):
    institution: str = Field(..., description="Université ou école")
    degree: str = Field(..., description="Diplôme obtenu")
    field: Optional[str] = None
    year: Optional[str] = None

class CVStructure(BaseModel):
    personal_info: PersonalInfo
    headline: Optional[str] = Field(None, description="Titre professionnel")
    summary: Optional[str] = Field(None, description="Résumé du profil")
    experience_years: int = Field(0, description="Années d'expérience estimées")
    skills: List[str] = Field(default_factory=list, description="Compétences techniques et humaines")
    educations: List[EducationItem] = Field(default_factory=list)
    experiences: List[ExperienceItem] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list, description="Langues maîtrisées (Français, Arabe, Anglais...)")
    raw_text: Optional[str] = None
    ocr_metadata: Optional[Dict[str, Any]] = Field(None, description="Métadonnées d'extraction OCR (si document scanné ou image)")
