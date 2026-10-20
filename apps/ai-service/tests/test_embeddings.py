from app.services.embeddings import generate_embedding, cosine_similarity

def test_generate_embedding_dimension():
    vec = generate_embedding("Développeur Full-Stack TypeScript NestJS à Tunis")
    assert len(vec) == 768
    assert isinstance(vec[0], float)

def test_cosine_similarity_identical():
    text = "Ingénieur DevOps Cloud Kubernetes Docker"
    v1 = generate_embedding(text)
    v2 = generate_embedding(text)
    sim = cosine_similarity(v1, v2)
    assert abs(sim - 1.0) < 1e-4

def test_cosine_similarity_different():
    v1 = generate_embedding("Développeur Frontend React Tailwind CSS")
    v2 = generate_embedding("Comptable fiscaliste gestion de paie à Sfax")
    sim = cosine_similarity(v1, v2)
    assert sim < 0.9  # Nettement inférieur à des textes similaires
