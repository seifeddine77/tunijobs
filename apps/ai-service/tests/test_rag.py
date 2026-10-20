import pytest
from app.services.rag_engine import rag_engine
from app.services.text_extractor import extract_text_from_pdf_or_image

def test_rag_retrieval_and_generation():
    query = "DevOps Cloud Kubernetes à Tunis"
    result = rag_engine.query(query, top_k=2)

    assert "answer" in result
    assert "sources" in result
    assert len(result["sources"]) > 0
    assert result["sources"][0]["company"] == "Vermeg Tunisie"
    assert "Vermeg" in result["answer"]

def test_ocr_text_extraction_fallback():
    # Test avec un buffer simulant une image
    dummy_image_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
    res = extract_text_from_pdf_or_image(dummy_image_bytes, filename="cv_scanne.png")

    assert res["ocr_applied"] is True
    assert res["extraction_method"] == "tesseract_ocr"
    assert "text" in res
