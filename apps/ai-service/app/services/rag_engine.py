import numpy as np
from typing import List, Dict, Any, Optional
from app.services.embeddings import generate_embedding

# Base de connaissances documentaire intégrée (RAG Grounding pour la Tunisie)
DEFAULT_KNOWLEDGE_DOCUMENTS = [
    {
        "id": "doc-cloud-vermeg",
        "title": "Architecte Cloud AWS & DevOps",
        "company": "Vermeg Tunisie",
        "governorate": "Tunis (Les Berges du Lac 2)",
        "contract": "CDI",
        "salary": "3500 - 5500 TND",
        "skills": ["AWS", "Kubernetes", "Docker", "Terraform", "CI/CD", "Linux"],
        "content": "Conception et déploiement d'infrastructures Cloud bancaires hautement résilientes sur AWS et Kubernetes. Vermeg recherche un architecte senior avec 5+ ans d'expérience.",
    },
    {
        "id": "doc-fullstack-vermeg",
        "title": "Développeur Full-Stack NestJS & React",
        "company": "Vermeg Tunisie",
        "governorate": "Tunis",
        "contract": "CDI",
        "salary": "2500 - 3800 TND",
        "skills": ["TypeScript", "NestJS", "React", "PostgreSQL", "Prisma"],
        "content": "Développement de modules financiers distribués en TypeScript, microservices NestJS et interfaces React. Télétravail hybride (2 jours/semaine).",
    },
    {
        "id": "doc-data-bi",
        "title": "Data Analyst & BI Specialist",
        "company": "Vermeg Tunisie",
        "governorate": "Ariana (Ghazela Technopark)",
        "contract": "CDD",
        "salary": "2000 - 3000 TND",
        "skills": ["Python", "SQL", "PowerBI", "Data Warehousing", "ETL"],
        "content": "Analyse décisionnelle des flux bancaires, création de tableaux de bord exécutifs PowerBI et modélisation SQL.",
    },
    {
        "id": "doc-embedded-telnet",
        "title": "Développeur Système Embarqué",
        "company": "Telnet Holding",
        "governorate": "Sfax",
        "contract": "CDI",
        "salary": "2200 - 3500 TND",
        "skills": ["C", "C++", "RTOS", "Linux Embarqué", "Microcontrôleurs"],
        "content": "Conception logicielle pour l'avionique et les systèmes aérospatiaux tunisiens. Maîtrise de C/C++ temps réel.",
    },
    {
        "id": "doc-mobile-telnet",
        "title": "Développeur Mobile Flutter (SIVP)",
        "company": "Telnet Holding",
        "governorate": "Sfax",
        "contract": "SIVP",
        "salary": "1200 - 1800 TND",
        "skills": ["Flutter", "Dart", "Firebase", "REST API"],
        "content": "Contrat SIVP éligible aux jeunes diplômés tunisiens. Développement d'applications cross-platform sous Flutter.",
    },
    {
        "id": "doc-legal-contracts",
        "title": "Réglementation des contrats de travail en Tunisie",
        "company": "Ministère de la Formation Professionnelle et de l'Emploi",
        "governorate": "National (24 Gouvernorats)",
        "contract": "Réglementaire",
        "salary": "Grille conventionnelle",
        "skills": ["SIVP", "Karama", "CDI", "Code du Travail"],
        "content": "Le contrat SIVP exonère les entreprises de cotisations CNSS pour les primo-demandeurs diplômés de l'enseignement supérieur. Le contrat Karama offre une prise en charge salariale pour les chômeurs de longue durée.",
    },
]

class RAGEngine:
    def __init__(self):
        self.documents: List[Dict[str, Any]] = DEFAULT_KNOWLEDGE_DOCUMENTS
        self.doc_embeddings: List[np.ndarray] = []
        self._initialize_index()

    def _initialize_index(self):
        """Indexe les documents avec des vecteurs d'embeddings 768d."""
        self.doc_embeddings = []
        for doc in self.documents:
            text_to_embed = f"{doc['title']} {doc['company']} {doc['governorate']} {' '.join(doc.get('skills', []))} {doc.get('content', '')}"
            emb = np.array(generate_embedding(text_to_embed), dtype=np.float32)
            self.doc_embeddings.append(emb)

    def add_document(self, doc: Dict[str, Any]):
        """Ajoute dynamiquement une nouvelle offre d'emploi ou document à l'index vectoriel RAG."""
        self.documents.append(doc)
        text_to_embed = f"{doc.get('title', '')} {doc.get('company', '')} {doc.get('governorate', '')} {' '.join(doc.get('skills', []))} {doc.get('content', '')}"
        emb = np.array(generate_embedding(text_to_embed), dtype=np.float32)
        self.doc_embeddings.append(emb)

    def retrieve(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Phase 1 du RAG : Dense Retrieval par similarité cosinus (pgvector-style).
        """
        query_emb = np.array(generate_embedding(query), dtype=np.float32)
        scores = []
        for i, doc_emb in enumerate(self.doc_embeddings):
            dot = np.dot(query_emb, doc_emb)
            norm = (np.linalg.norm(query_emb) * np.linalg.norm(doc_emb)) or 1.0
            similarity = float(dot / norm)
            scores.append((similarity, self.documents[i]))

        scores.sort(key=lambda x: x[0], reverse=True)
        results = []
        for sim, doc in scores[:top_k]:
            results.append({
                "similarity_score": round(max(0.0, sim) * 100, 1),
                **doc,
            })
        return results

    def generate(self, query: str, retrieved_docs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Phase 2 & 3 du RAG : Augmentation de contexte + Génération factuelle avec citations.
        """
        if not retrieved_docs:
            return {
                "answer": "Aucune opportunité correspondant spécifiquement à votre recherche n'a été trouvée dans notre base.",
                "sources": [],
            }

        top_doc = retrieved_docs[0]
        sources = [
            {
                "title": d["title"],
                "company": d["company"],
                "governorate": d["governorate"],
                "salary": d["salary"],
                "contract": d["contract"],
                "similarity": f"{d['similarity_score']}%",
            }
            for d in retrieved_docs
        ]

        # Synthèse générée augmentée par les documents récupérés
        answer_parts = [
            f"D'après les données consolidées du marché de l'emploi tunisien, voici les opportunités les plus pertinentes :",
            f"1. **{top_doc['title']}** chez **{top_doc['company']}** ({top_doc['governorate']}) en contrat **{top_doc['contract']}**.",
            f"   - Salaire estimé : **{top_doc['salary']}**.",
            f"   - Compétences prioritaires : **{', '.join(top_doc['skills'][:4])}**.",
            f"   - Contexte : {top_doc['content']}",
        ]

        if len(retrieved_docs) > 1:
            second = retrieved_docs[1]
            answer_parts.append(
                f"2. Également recommandé : **{second['title']}** chez **{second['company']}** ({second['governorate']}) avec un salaire de **{second['salary']}**."
            )

        answer_parts.append(
            "💡 **Conseil IA TuniJobs** : Pour maximiser votre compatibilité, vérifiez que votre CV mentionne explicitement vos compétences techniques et gouvernorats souhaités."
        )

        return {
            "answer": "\n".join(answer_parts),
            "sources": sources,
            "retrieved_count": len(retrieved_docs),
            "rag_pipeline": "768d_DenseRetrieval_AugmentedSynthesis",
        }

    def query(self, query: str, top_k: int = 3) -> Dict[str, Any]:
        """Pipeline RAG complet (Retrieval + Augmentation + Generation)."""
        retrieved = self.retrieve(query, top_k)
        return self.generate(query, retrieved)

# Instance unique du moteur RAG
rag_engine = RAGEngine()
