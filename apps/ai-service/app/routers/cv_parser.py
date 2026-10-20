from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from app.models.cv_schema import CVStructure
from app.services.text_extractor import extract_text_from_pdf_or_image
from app.services.llm_service import parse_cv_text_with_llm
from pydantic import BaseModel

router = APIRouter(prefix="/ai", tags=["Parsing de CV & OCR"])

class RawTextRequest(BaseModel):
    raw_text: str

@router.post("/parse-cv", response_model=CVStructure)
async def parse_cv_file(
    file: Optional[UploadFile] = File(None),
    raw_text: Optional[str] = Form(None),
):
    """
    Extrait et structure les informations d'un CV avec OCR automatique :
    - Fichiers PDF (numériques ou scannés avec extraction OCR)
    - Fichiers Images directes (.png, .jpg, .jpeg, .tiff, .webp)
    - Texte brut
    """
    text_content = ""
    ocr_meta = None

    if file:
        allowed_extensions = (".pdf", ".png", ".jpg", ".jpeg", ".tiff", ".bmp", ".webp")
        if not file.filename.lower().endswith(allowed_extensions):
            raise HTTPException(
                status_code=400,
                detail="Formats supportés : PDF, PNG, JPG, JPEG, TIFF (documents scannés ou numériques)",
            )
        try:
            content = await file.read()
            extract_res = extract_text_from_pdf_or_image(content, file.filename)
            text_content = extract_res["text"]
            ocr_meta = {
                "extraction_method": extract_res["extraction_method"],
                "ocr_applied": extract_res["ocr_applied"],
                "confidence": extract_res["confidence"],
                "page_count": extract_res["page_count"],
            }
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Erreur traitement OCR document : {str(e)}")
    elif raw_text:
        text_content = raw_text
    else:
        raise HTTPException(status_code=400, detail="Veuillez fournir un fichier PDF/Image ou le texte brut du CV")

    if not text_content.strip():
        raise HTTPException(status_code=400, detail="Le document ne contient aucun texte exploitable")

    parsed = parse_cv_text_with_llm(text_content)
    parsed.ocr_metadata = ocr_meta
    return parsed

@router.post("/parse-cv-text", response_model=CVStructure)
async def parse_cv_raw_text(req: RawTextRequest):
    """Extraction à partir d'un payload JSON direct."""
    if not req.raw_text.strip():
        raise HTTPException(status_code=400, detail="Le texte est vide")
    return parse_cv_text_with_llm(req.raw_text)
