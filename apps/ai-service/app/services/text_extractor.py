import io
from typing import Optional
from pypdf import PdfReader

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extrait le texte brut d'un flux binaire PDF."""
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        text_pages = []
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                text_pages.append(text)
        return "\n\n".join(text_pages).strip()
    except Exception as e:
        raise ValueError(f"Impossible de lire le document PDF : {str(e)}")
