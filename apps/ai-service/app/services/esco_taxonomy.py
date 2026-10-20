from typing import List, Dict, Set

# Dictionnaire de normalisation de compétences (Synonymes -> Terme standard ESCO)
SKILL_SYNONYMS: Dict[str, str] = {
    # Frontend
    "react": "React",
    "reactjs": "React",
    "react.js": "React",
    "vue": "Vue.js",
    "vuejs": "Vue.js",
    "vue.js": "Vue.js",
    "angular": "Angular",
    "angularjs": "Angular",
    "next": "Next.js",
    "nextjs": "Next.js",
    "next.js": "Next.js",
    "tailwind": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",
    "html": "HTML5",
    "html5": "HTML5",
    "css": "CSS3",
    "css3": "CSS3",
    "sass": "SASS/SCSS",
    "scss": "SASS/SCSS",

    # Backend
    "node": "Node.js",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "nest": "NestJS",
    "nestjs": "NestJS",
    "nest.js": "NestJS",
    "express": "Express.js",
    "expressjs": "Express.js",
    "django": "Django",
    "fastapi": "FastAPI",
    "flask": "Flask",
    "spring": "Spring Boot",
    "springboot": "Spring Boot",
    "spring boot": "Spring Boot",
    "laravel": "Laravel",
    "symfony": "Symfony",
    "dotnet": ".NET",
    ".net": ".NET",
    "asp.net": ".NET",

    # Langages
    "js": "JavaScript",
    "javascript": "JavaScript",
    "ts": "TypeScript",
    "typescript": "TypeScript",
    "py": "Python",
    "python": "Python",
    "java": "Java",
    "php": "PHP",
    "c#": "C#",
    "c++": "C/C++",
    "cpp": "C/C++",
    "c/c++": "C/C++",
    "golang": "Go",
    "go": "Go",
    "rust": "Rust",
    "dart": "Flutter",
    "flutter": "Flutter",

    # Bases de données & Stockage
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "psql": "PostgreSQL",
    "mysql": "MySQL",
    "mariadb": "MariaDB",
    "mongodb": "MongoDB",
    "mongo": "MongoDB",
    "redis": "Redis",
    "postgis": "PostGIS",
    "sqlite": "SQLite",

    # DevOps & Cloud
    "docker": "Docker",
    "k8s": "Kubernetes",
    "kubernetes": "Kubernetes",
    "aws": "AWS",
    "amazon web services": "AWS",
    "azure": "Azure",
    "gcp": "Google Cloud",
    "google cloud": "Google Cloud",
    "terraform": "Terraform",
    "ansible": "Ansible",
    "ci/cd": "CI/CD",
    "git": "Git",
    "github": "Git",
    "gitlab": "Git",

    # Data & IA
    "machine learning": "Machine Learning",
    "ml": "Machine Learning",
    "deep learning": "Deep Learning",
    "nlp": "NLP",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "scikit-learn": "Scikit-Learn",
    "pytorch": "PyTorch",
    "tensorflow": "TensorFlow",
    "power bi": "Power BI",
    "powerbi": "Power BI",
    "tableau": "Tableau",
}

def normalize_skill(skill: str) -> str:
    """Normalise une chaîne de compétence vers sa référence canonique."""
    if not skill:
        return ""
    cleaned = skill.strip().lower()
    return SKILL_SYNONYMS.get(cleaned, skill.strip().title())

def normalize_skill_list(skills: List[str]) -> List[str]:
    """Nettoie et déduplique une liste de compétences."""
    result: Set[str] = set()
    for s in skills:
        norm = normalize_skill(s)
        if norm:
            result.add(norm)
    return sorted(list(result))
