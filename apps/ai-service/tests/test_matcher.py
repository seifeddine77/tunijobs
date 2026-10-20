from app.models.match_schema import MatchRequest, CandidateMatchInput, JobRequirement
from app.services.hybrid_matcher import compute_hybrid_match

def test_high_match_candidate():
    req = MatchRequest(
        candidate=CandidateMatchInput(
            headline="Développeur Full-Stack TypeScript",
            experience_years=4,
            skills=["TypeScript", "NestJS", "React", "PostgreSQL", "Docker"],
            preferred_governorates=["11", "12"],
            summary="Développeur avec 4 ans d'expérience sur NestJS et React.",
        ),
        job=JobRequirement(
            title="Développeur Full-Stack NestJS & React",
            description="Conception de plateformes bancaires modernes à Tunis.",
            requirements="TypeScript, NestJS, React, Docker requis.",
            skills=["TypeScript", "NestJS", "React", "Docker"],
            work_mode="HYBRID",
            governorate_code="11",
            min_experience_years=3,
        ),
    )

    res = compute_hybrid_match(req)
    assert res.score >= 80.0
    assert res.is_eligible is True
    assert len(res.matched_skills) >= 4
    assert len(res.unmet_filters) == 0
    assert "TypeScript" in res.explanation

def test_hard_filter_location_unmet():
    req = MatchRequest(
        candidate=CandidateMatchInput(
            headline="Développeur Mobile Flutter",
            experience_years=2,
            skills=["Flutter", "Dart"],
            preferred_governorates=["51"], # Seulement Sousse
        ),
        job=JobRequirement(
            title="Développeur Flutter",
            description="Poste 100% sur site à Sfax.",
            requirements="Flutter sur site obligatoire.",
            skills=["Flutter"],
            work_mode="ON_SITE",
            governorate_code="61", # Sfax
            min_experience_years=1,
        ),
    )

    res = compute_hybrid_match(req)
    assert res.is_eligible is False
    assert len(res.unmet_filters) > 0
    assert "61" in res.unmet_filters[0]

def test_ethical_blind_matching():
    """
    Garantie éthique : le schéma d'entrée CandidateMatchInput ne comporte
    aucun champ de genre, âge, nom, photo ou nationalité.
    """
    fields = CandidateMatchInput.model_fields.keys()
    assert "gender" not in fields
    assert "age" not in fields
    assert "photo" not in fields
    assert "name" not in fields
    assert "nationality" not in fields
