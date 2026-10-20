from typing import List, Dict, Tuple
from app.models.match_schema import MatchRequest, MatchResponse
from app.services.esco_taxonomy import normalize_skill_list
from app.services.embeddings import generate_embedding, cosine_similarity

def compute_hybrid_match(req: MatchRequest) -> MatchResponse:
    """
    Moteur de recommandation et scoring hybride conforme aux exigences éthiques :
    1. Validation des filtres durs (Expérience minimale, Mobilité/Télétravail).
    2. Recouvrement des compétences normalisées ESCO.
    3. Similarité sémantique vectorielle (pgvector cosine).
    4. Adéquation de l'expérience professionnelle.
    5. Explicabilité complète et garde-fous anti-discrimination.
    """
    candidate = req.candidate
    job = req.job

    unmet_filters: List[str] = []
    strengths: List[str] = []

    # ---------------------------------------------------------
    # 1. FILTRES DURS (Éliminatoires ou avertissements)
    # ---------------------------------------------------------
    # Mobilité géographique (sauf si télétravail complet)
    if job.work_mode != "REMOTE" and job.governorate_code:
        if candidate.preferred_governorates and len(candidate.preferred_governorates) > 0:
            if job.governorate_code not in candidate.preferred_governorates:
                unmet_filters.append(
                    f"Le poste est situé dans le gouvernorat ({job.governorate_code}) non inclus dans vos zones souhaitées."
                )

    # Expérience minimale requise
    if job.min_experience_years > 0:
        if candidate.experience_years < job.min_experience_years:
            diff = job.min_experience_years - candidate.experience_years
            if diff > 1:
                unmet_filters.append(
                    f"Expérience requise : {job.min_experience_years} ans (Profil actuel : {candidate.experience_years} an{'s' if candidate.experience_years > 1 else ''})."
                )

    is_eligible = len(unmet_filters) == 0

    # ---------------------------------------------------------
    # 2. SCORE DE COMPÉTENCES NORMALISÉES ESCO (40%)
    # ---------------------------------------------------------
    candidate_skills = normalize_skill_list(candidate.skills)
    job_skills = normalize_skill_list(job.skills)

    matched_skills = [s for s in job_skills if s in candidate_skills]
    missing_skills = [s for s in job_skills if s not in candidate_skills]

    if job_skills:
        skill_score = (len(matched_skills) / len(job_skills)) * 100.0
    else:
        skill_score = 75.0  # Si aucune compétence stricte spécifiée

    if matched_skills:
        strengths.append(
            f"{len(matched_skills)} compétence{'s' if len(matched_skills) > 1 else ''} clé{'s' if len(matched_skills) > 1 else ''} validée{'s' if len(matched_skills) > 1 else ''} ({', '.join(matched_skills[:4])})"
        )

    # ---------------------------------------------------------
    # 3. SCORE SÉMANTIQUE VECTORIEL (40%)
    # ---------------------------------------------------------
    candidate_text = f"{candidate.headline or ''} {' '.join(candidate_skills)} {candidate.summary or ''}"
    job_text = f"{job.title} {job.requirements} {' '.join(job_skills)}"

    vec_candidate = generate_embedding(candidate_text)
    vec_job = generate_embedding(job_text)
    sim = cosine_similarity(vec_candidate, vec_job)
    # Mise à l'échelle [0.0 - 1.0] -> [40.0 - 100.0]
    semantic_score = min(100.0, max(0.0, (sim * 50.0) + 50.0))

    if semantic_score >= 80:
        strengths.append("Forte similarité sémantique avec la fiche de poste et les missions décrites.")

    # ---------------------------------------------------------
    # 4. SCORE D'EXPÉRIENCE (20%)
    # ---------------------------------------------------------
    if job.min_experience_years > 0:
        ratio = candidate.experience_years / float(job.min_experience_years)
        if ratio >= 1.0:
            exp_score = min(100.0, 85.0 + min(15.0, (ratio - 1.0) * 10.0))
            strengths.append(f"Niveau d'expérience conforme ({candidate.experience_years} ans pour {job.min_experience_years} ans requis).")
        else:
            exp_score = max(30.0, ratio * 85.0)
    else:
        exp_score = 85.0
        strengths.append("Poste ouvert à tous niveaux d'expérience.")

    # ---------------------------------------------------------
    # 5. SCORE GLOBAL PONDÉRÉ
    # ---------------------------------------------------------
    w_skill = req.skill_weight
    w_sem = req.semantic_weight
    w_exp = req.experience_weight
    total_weights = w_skill + w_sem + w_exp

    raw_score = (
        (skill_score * w_skill) +
        (semantic_score * w_sem) +
        (exp_score * w_exp)
    ) / total_weights

    # Pénalité si critères durs non respectés
    if not is_eligible:
        final_score = round(raw_score * 0.65, 1)
    else:
        final_score = round(raw_score, 1)

    # Plafond éthique
    final_score = min(98.0, max(15.0, final_score))

    # ---------------------------------------------------------
    # 6. EXPLICATIONS EN LANGAGE NATUREL
    # ---------------------------------------------------------
    if final_score >= 80:
        appreciation = "Excellente adéquation avec cette offre."
    elif final_score >= 60:
        appreciation = "Bonne correspondance globale avec quelques compétences complémentaires à valoriser."
    else:
        appreciation = "Correspondance partielle avec les prérequis de cette offre."

    explanation_parts = [
        f"Score de compatibilité estimé à {final_score}% : {appreciation}",
    ]

    if matched_skills:
        explanation_parts.append(
            f"Vous maîtrisez {len(matched_skills)} prérequis sur {len(job_skills)} demandés ({', '.join(matched_skills)})."
        )

    if missing_skills:
        explanation_parts.append(
            f"Compétences à consolider : {', '.join(missing_skills[:3])}."
        )

    if unmet_filters:
        explanation_parts.append("Points d'attention : " + " ".join(unmet_filters))

    explanation = " ".join(explanation_parts)

    return MatchResponse(
        score=final_score,
        is_eligible=is_eligible,
        unmet_filters=unmet_filters,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        strengths=strengths,
        explanation=explanation,
        sub_scores={
            "skills_score": round(skill_score, 1),
            "semantic_score": round(semantic_score, 1),
            "experience_score": round(exp_score, 1),
        },
    )
