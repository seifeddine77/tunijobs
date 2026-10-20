from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List
from app.services.embeddings import generate_embedding

router = APIRouter(prefix="/ai", tags=["Embeddings & Vecteurs"])

class EmbeddingRequest(BaseModel):
    text: str = Field(..., description="Texte à vectoriser")

class EmbeddingResponse(BaseModel):
    embedding: List[float] = Field(..., description="Vecteur 768 dimensions normalisé pour pgvector")
    dimension: int = 768

@router.post("/embeddings", response_model=EmbeddingResponse)
async def create_embedding(request: EmbeddingRequest):
    """
    Génère un vecteur d'embedding de 768 dimensions compatible pgvector.
    """
    vec = generate_embedding(request.text, dim=768)
    return EmbeddingResponse(embedding=vec, dimension=len(vec))
