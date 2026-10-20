from fastapi import APIRouter
from app.models.match_schema import MatchRequest, MatchResponse
from app.services.hybrid_matcher import compute_hybrid_match

router = APIRouter(prefix="/ai", tags=["Matching & Recommandations"])

@router.post("/match", response_model=MatchResponse)
async def match_candidate_to_job(request: MatchRequest):
    """
    Calcule le score d'adéquation hybride (0-100) et fournit une explication transparente.
    Garde-fous : les données personnelles (nom, genre, âge, photo) ne sont JAMAIS prises en compte.
    """
    return compute_hybrid_match(request)
