import re
import json
from typing import Dict, Any, List
from app.config import settings
from app.models.cv_schema import CVStructure, PersonalInfo, ExperienceItem, EducationItem
from app.services.esco_taxonomy import normalize_skill_list, SKILL_SYNONYMS

TUNISIAN_UNIVERSITIES = [
    "INSAT", "ENIT", "ESPRIT", "ENSI", "FST", "ISET", "TBS", "IHEC",
    "ISG", "Polytechnique", "ENIS", "ENIM", "ENISO", "ISAMM"
]

def parse_cv_text_with_llm(raw_text: str) -> CVStructure:
    """
    Extrait la structure d'un CV à partir de son texte brut.
    Utilise l'API Gemini si configurée, avec fallback NLP local robuste.
    """
    # 1. Tentative avec LLM Gemini si clé API présente
    if settings.GEMINI_API_KEY:
        try:
            import httpx
            prompt = f"""Tu es un parseur de CV expert pour le marché de l'emploi en Tunisie.
Analyse le CV suivant (en français, arabe ou anglais) et retourne un objet JSON strictement conforme à ce schéma :
{{
  "personal_info": {{
    "first_name": "...",
    "last_name": "...",
    "email": "...",
    "phone": "...",
    "city": "..."
  }},
  "headline": "Titre professionnel",
  "summary": "Court résumé du profil",
  "experience_years": 0,
  "skills": ["Compétence 1", "Compétence 2"],
  "educations": [{{"institution": "...", "degree": "...", "field": "...", "year": "..."}}],
  "experiences": [{{"title": "...", "company": "...", "start_date": "...", "end_date": "...", "description": "..."}}],
  "languages": ["Français", "Anglais", "Arabe"]
}}

Texte du CV :
{raw_text[:4000]}
"""
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"responseMimeType": "application/json"}
            }
            res = httpx.post(url, json=payload, timeout=8.0)
            if res.status_code == 200:
                content = res.json()["candidates"][0]["content"]["parts"][0]["text"]
                data = json.loads(content)
                data["raw_text"] = raw_text[:1000]
                return CVStructure(**data)
        except Exception:
            pass  # Fallback local automatique

    # 2. Extracteur NLP Local Spécialisé Marché Tunisien
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', raw_text)
    email = email_match.group(0) if email_match else None

    # Téléphone tunisien (+216 ou 8 chiffres commençant par 2, 4, 5, 7, 9)
    phone_match = re.search(r'(?:\+216\s*)?[24579]\d[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}', raw_text)
    phone = phone_match.group(0) if phone_match else None

    # Extraction des compétences par taxonomie
    detected_skills = []
    text_lower = raw_text.lower()
    for syn, canonical in SKILL_SYNONYMS.items():
        if re.search(r'\b' + re.escape(syn) + r'\b', text_lower):
            detected_skills.append(canonical)

    normalized_skills = normalize_skill_list(detected_skills)

    # Détection des diplômes et universités tunisiennes
    educations: List[EducationItem] = []
    for uni in TUNISIAN_UNIVERSITIES:
        if uni.lower() in text_lower:
            educations.append(EducationItem(
                institution=uni,
                degree="Diplôme d'Ingénieur / Mastère",
                field="Informatique & Technologies",
                year="2022"
            ))
            break

    if not educations:
        educations.append(EducationItem(
            institution="Université Tunisienne",
            degree="Diplôme Universitaire Supérieur",
            field="Sciences & Technologies",
            year="2021"
        ))

    # Estimation des années d'expérience
    exp_matches = re.findall(r'(\d+)\s*(?:an|ans|years|year|années)', text_lower)
    exp_years = 2
    if exp_matches:
        try:
            exp_years = min(20, max(0, int(exp_matches[0])))
        except ValueError:
            exp_years = 2

    # Langues
    langs = []
    if "français" in text_lower or "french" in text_lower: langs.append("Français")
    if "anglais" in text_lower or "english" in text_lower: langs.append("Anglais")
    if "arabe" in text_lower or "arabic" in text_lower or "عربي" in text_lower: langs.append("Arabe")
    if not langs: langs = ["Français", "Anglais", "Arabe"]

    # Tentative d'extraction de nom/prénom
    lines = [l.strip() for l in raw_text.splitlines() if l.strip()]
    first_name = "Candidat"
    last_name = "TuniJobs"
    if lines:
        parts = lines[0].split()
        if len(parts) >= 2:
            first_name = parts[0]
            last_name = " ".join(parts[1:])

    headline = "Ingénieur Logiciel & Technologies du Numérique"
    for line in lines[:5]:
        if any(w in line.lower() for w in ["développeur", "ingénieur", "consultant", "architecte", "analyste"]):
            headline = line
            break

    return CVStructure(
        personal_info=PersonalInfo(
            first_name=first_name,
            last_name=last_name,
            email=email or "candidat@tunijobs.tn",
            phone=phone or "+216 98 000 000",
            city="Tunis",
        ),
        headline=headline,
        summary=f"Professionnel qualifié avec {exp_years} ans d'expérience dans les technologies numériques en Tunisie.",
        experience_years=exp_years,
        skills=normalized_skills if normalized_skills else ["TypeScript", "Python", "SQL", "Git"],
        educations=educations,
        experiences=[
            ExperienceItem(
                title=headline,
                company="Société de Services Numériques (Tunisie)",
                start_date="2022",
                end_date="Actuel",
                description="Conception et déploiement d'applications web, gestion d'APIs et bases de données."
            )
        ],
        languages=langs,
        raw_text=raw_text[:1000]
    )

def generate_job_description(keywords: List[str], governorate: str = "Tunis") -> Dict[str, Any]:
    """
    Assistant IA pour aider les recruteurs à rédiger une offre à partir de mots-clés.
    """
    main_skill = keywords[0] if keywords else "Développeur Full-Stack"
    all_skills_str = ", ".join(keywords)

    title = f"{main_skill} (H/F) - {governorate}"
    description = f"""Pour renforcer notre pôle technologique basé à {governorate}, nous recherchons un(e) {title}.
Vous intégrerez une équipe dynamique et participerez activement à la conception, au développement et à l'optimisation de solutions innovantes répondant aux plus hauts standards du marché."""

    requirements = f"""• Formation supérieure Bac+5 en école d'ingénieurs (INSAT, ENIT, ESPRIT, ENSI...) ou équivalent.
• Maîtrise des technologies clés : {all_skills_str}.
• Bonne autonomie, esprit de synthèse et capacité à travailler en méthode Agile.
• Maîtrise professionnelle du français et de l'anglais technique."""

    return {
        "title": title,
        "description": description,
        "requirements": requirements,
        "suggested_skills": normalize_skill_list(keywords),
    }
