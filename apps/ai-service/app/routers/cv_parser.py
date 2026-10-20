from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from app.models.cv_schema import CVStructure
from app.services.text_extractor import extract_text_from_pdf
from app.services.llm_service import parse_cv_text_with_llm
from pydantic import BaseModel

router = APIRouter(prefix="/ai", tags=["Parsing de CV"])

class RawTextRequest(BaseModel):
    raw_text: str

@router.post("/parse-cv", response_model=CVStructure)
async def parse_cv_file(
    file: Optional[UploadFile] = File(None),
    raw_text: Optional[str] = Form(None),
):
    """
    Extrait et structure les informations d'un CV (PDF ou texte brut).
    Sortie JSON validée par schéma Pydantic (formations, expériences, compétences ESCO, langues).
    """
    text_content = ""

    if file:
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Seuls les fichiers PDF sont acceptés pour le moment")
        try:
            content = await file.read()
            text_content = extract_text_from_pdf(content)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Erreur lecture document : {str(e)}")
    elif raw_text:
        text_content = raw_text
    else:
        raise HTTPException(status_code=400, detail="Veuillez fournir un fichier PDF ou le texte brut du CV")

    if not text_content.strip():
        raise HTTPException(status_code=400, detail="Le document ne contient aucun texte exploitable")

    return parse_cv_text_with_llm(text_content)

@router.post("/parse-cv-text", response_model=CVStructure)
async def parse_cv_raw_text(req: RawTextRequest):
    """Extraction à partir d'un payload JSON direct."""
    if not req.raw_text.strip():
        raise HTTPException(status_code=400, detail="Le texte est vide")
    return parse_cv_text_with_llm(req.raw_text)
