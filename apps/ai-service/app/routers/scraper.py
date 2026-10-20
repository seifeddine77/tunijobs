from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, HttpUrl
from typing import List, Dict, Any
from app.services.job_scraper import scraper_service

router = APIRouter(prefix="/ai/scraper", tags=["Web Scraping & Collecte Automatique"])

class ScrapeUrlRequest(BaseModel):
    url: str = Field(..., description="URL d'une offre d'emploi sur un portail tunisien (Keejob, Tanitjobs, etc.)")

class RunScrapingBatchRequest(BaseModel):
    count: int = Field(4, description="Nombre d'offres fraîches à collecter")

@router.post("/parse-url")
async def scrape_single_url(req: ScrapeUrlRequest):
    """
    Collecte et extrait automatiquement les métadonnées structurées d'une offre d'emploi
    à partir de son URL sur internet (Web Scraping + NLP).
    """
    if not req.url.startswith("http"):
        raise HTTPException(status_code=400, detail="L'URL doit commencer par http:// ou https://")
    return await scraper_service.scrape_url(req.url)

@router.post("/run-batch")
async def run_batch_scraping(req: RunScrapingBatchRequest):
    """
    Exécute un cycle de collecte automatique batch pour importer de nouvelles opportunités d'emploi
    réparties sur les gouvernorats tunisiens (Tunis, Ariana, Sfax, Sousse...).
    """
    items = await scraper_service.run_batch_scraping(req.count)
    return {
        "status": "success",
        "collected_count": len(items),
        "source": "WebScraping_Tunisie_Automated",
        "jobs": items,
    }
