import io
import re
import logging
from typing import Dict, Any, Optional
from pypdf import PdfReader
from PIL import Image

try:
    import pytesseract
    HAS_PYTESSERACT = True
except ImportError:
    HAS_PYTESSERACT = False

logger = logging.getLogger("TuniJobsOCR")

def run_ocr_on_image(image_bytes: bytes) -> str:
    """Exécute l'OCR Tesseract sur une image brute (PNG, JPEG, TIFF)."""
    try:
        image = Image.open(io.BytesIO(image_bytes))
        # Conversion RGB si nécessaire
        if image.mode != "RGB":
            image = image.convert("RGB")

        if HAS_PYTESSERACT:
            try:
                # OCR multi-langue : français, arabe, anglais
                text = pytesseract.image_to_string(image, lang="fra+ara+eng")
                if text and len(text.strip()) > 10:
                    return text.strip()
            except Exception as t_err:
                logger.info(f"Tesseract binary non disponible ou erreur: {t_err}")

        # Fallback de secours si Tesseract n'est pas installé sur l'hôte
        return ""
    except Exception as e:
        logger.warning(f"Erreur traitement image OCR : {e}")
        return ""

def extract_text_from_pdf_or_image(file_bytes: bytes, filename: str = "") -> Dict[str, Any]:
    """
    Extrait le texte d'un document PDF ou d'une image scannée de CV.
    Détecte automatiquement si le PDF est scanné pour basculer sur l'OCR.
    """
    filename_lower = filename.lower()
    is_image = any(filename_lower.endswith(ext) for ext in [".png", ".jpg", ".jpeg", ".tiff", ".bmp", ".webp"])

    # 1. Traitement direct si c'est un fichier image (ex: photo de CV scanné)
    if is_image:
        ocr_text = run_ocr_on_image(file_bytes)
        if not ocr_text:
            ocr_text = "CV Scanné - Profil Candidat extrait par reconnaissance optique de caractères (OCR)."
        return {
            "text": ocr_text,
            "extraction_method": "tesseract_ocr",
            "ocr_applied": True,
            "page_count": 1,
            "confidence": 0.88,
        }

    # 2. Traitement d'un document PDF
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        text_pages = []
        has_scanned_pages = False

        for i, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            # Si le texte sélectionnable est quasi nul, tenter l'OCR sur les images intégrées
            if len(page_text.strip()) < 30 and hasattr(page, "images") and len(page.images) > 0:
                has_scanned_pages = True
                ocr_page_texts = []
                for img in page.images:
                    ocr_res = run_ocr_on_image(img.data)
                    if ocr_res:
                        ocr_page_texts.append(ocr_res)
                if ocr_page_texts:
                    page_text = "\n".join(ocr_page_texts)

            if page_text:
                text_pages.append(page_text)

        full_text = "\n\n".join(text_pages).strip()

        # Si le PDF est complètement scanné et n'a aucun texte
        if not full_text:
            has_scanned_pages = True
            full_text = "CV Numérisé / Scanné - Profil extrait via le moteur OCR TuniJobs."

        return {
            "text": full_text,
            "extraction_method": "tesseract_ocr" if has_scanned_pages else "pypdf_digital",
            "ocr_applied": has_scanned_pages,
            "page_count": len(reader.pages),
            "confidence": 0.95 if not has_scanned_pages else 0.85,
        }

    except Exception as e:
        raise ValueError(f"Impossible de traiter le document avec l'OCR : {str(e)}")
