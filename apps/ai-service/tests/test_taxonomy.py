from app.services.esco_taxonomy import normalize_skill, normalize_skill_list

def test_normalize_skill_synonyms():
    assert normalize_skill("react.js") == "React"
    assert normalize_skill("reactjs") == "React"
    assert normalize_skill("nest.js") == "NestJS"
    assert normalize_skill("nestjs") == "NestJS"
    assert normalize_skill("postgres") == "PostgreSQL"
    assert normalize_skill("psql") == "PostgreSQL"
    assert normalize_skill("k8s") == "Kubernetes"
    assert normalize_skill("flutter") == "Flutter"

def test_normalize_skill_list_deduplication():
    raw = ["react", "ReactJS", "Node.js", "node", "PostgreSQL", "psql"]
    normalized = normalize_skill_list(raw)
    assert "React" in normalized
    assert "Node.js" in normalized
    assert "PostgreSQL" in normalized
    # Pas de doublons
    assert len(normalized) == 3
