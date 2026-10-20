from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import cv_parser, matcher, embeddings, assistant

app = FastAPI(
    title="TuniJobs AI Service",
    description="Microservice d'Intelligence Artificielle pour TuniJobs : Parsing de CV, Normalisation ESCO, Embeddings pgvector et Matching Hybride Éthique.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusion des routeurs
app.include_router(cv_parser.router)
app.include_router(matcher.router)
app.include_router(embeddings.router)
app.include_router(assistant.router)

@app.get("/health")
def healthcheck():
    return {
        "status": "healthy",
        "service": "TuniJobs AI Microservice",
        "version": "1.0.0",
        "taxonomy": "ESCO Loaded",
        "embeddings": "768d Ready"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
