# 🇹🇳 TuniJobs — Plateforme Intelligente de Recrutement & Cartographie en Tunisie

> **TuniJobs** est une solution logicielle d'intermédiation pour le marché de l'emploi en Tunisie. Elle réunit un moteur de recommandation IA prédictif et explicable, une cartographie géospatiale interactive des 24 gouvernorats tunisiens, un pipeline de gestion des candidatures en Kanban et une administration stricte conforme au Registre National des Entreprises (RNE) et à la loi sur la protection des données personnelles (INPDP).

---

## 🏛️ Architecture Globale & Monorepo

```
tunijobs/
├── .github/
│   └── workflows/ci.yml         # Pipeline CI/CD GitHub Actions (Lint, Test, Build)
├── apps/
│   ├── api/                     # Backend NestJS (REST API, Swagger, JWT Auth, RBAC, BullMQ, Helmet)
│   ├── web/                     # Frontend Next.js 14 App Router, Tailwind CSS, MapLibre GL, Playwright
│   └── ai-service/              # Microservice Python FastAPI (Parsing CV, ESCO, Embeddings 768d, Matching)
├── packages/
│   ├── database/                # Prisma ORM, PostGIS & pgvector, scripts de seed tunisien réaliste
│   └── shared-types/            # Types TypeScript, 24 gouvernorats GeoJSON, validateurs (+216, RNE, TND)
├── docker/
│   ├── postgres/                # Dockerfile PostgreSQL 16 + PostGIS 3.6 + pgvector 0.8
│   └── minio/                   # Initialisation des buckets S3 MinIO
├── docker-compose.yml           # Environnement de développement conteneurisé
├── docker-compose.prod.yml      # Orchestration de production multi-conteneurs
└── README.md                    # Documentation complète
```

---

## ⚡ Stack Technologique Imposée

| Couche | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router) + TypeScript + Tailwind CSS + Lucide Icons + SEO Json-LD |
| **Cartographie** | MapLibre GL JS + Tuiles OpenStreetMap + GeoJSON haute fidélité des 24 gouvernorats |
| **Backend REST** | NestJS (TypeScript), Swagger/OpenAPI, Helmet, Throttler, Class-Validator |
| **Microservice IA** | Python 3.11 + FastAPI + Pydantic v2 + Sentence-Transformers (Embeddings 768d) |
| **Bases de Données** | PostgreSQL 16 + PostGIS 3.6 (géospatial) + pgvector 0.8 (vecteurs IA), Prisma ORM |
| **Files & Notifications** | Redis 7 + BullMQ (traitement asynchrone des candidatures et emails) |
| **Stockage Fichiers** | MinIO (compatible Amazon S3) pour CV et logos d'entreprises |
| **Sécurité & Auth** | JWT + Refresh Tokens, RBAC (`ADMIN`, `RECRUITER`, `CANDIDATE`), Helmet, Rate-Limit |
| **Tests & Qualité** | **Jest** (Backend API), **Pytest** (IA microservice), **Playwright** (E2E Frontend) |

---

## 🇹🇳 Conformités & Spécificités Tunisiennes

1. **Cartographie des 24 Gouvernorats & Délégations** :
   - Polygones GeoJSON précis intégrés dans l'interface et requêtes PostGIS (`ST_DWithin`, calcul Haversine pour le mode "Près de moi").
   - Choroplèthe dynamique visualisant la densité des offres d'emploi par gouvernorat (Ariana, Tunis, Sfax, Sousse, Bizerte, Nabeul, etc.).
2. **Matricule Fiscal RNE** :
   - Contrôle syntaxique rigoureux selon le format légal tunisien : `^\d{7}[A-Z]\/[A-Z]\/[A-Z]\/\d{3}$` (ex: `1234567A/A/M/000`).
3. **Téléphonie Nationale & Internationale** :
   - Format standard tunisien validé : `+216 [2,4,5,7,9]XX XX XXX`.
4. **Contrats de Travail Réglementaires** :
   - `CDI`, `CDD`, `SIVP` (Stage d'Initiation à la Vie Professionnelle), `KARAMA`, `STAGE`, `FREELANCE`.
5. **Grille Salariale en Dinars Tunisiens (TND)** avec salaires bruts mensuels réalistes.
6. **Loi Organique n° 2004-63 (Protection des Données - INPDP)** :
   - Consentement explicite obligatoire avant tout traitement algorithmique ou IA du CV.
   - Algorithme de scoring aveugle (exclusion totale du genre, de l'âge, de la photo et des origines).
   - Endpoints de portabilité des données (`GET /api/v1/candidates/export-data`) et droit à l'effacement (`DELETE /api/v1/candidates/account`).

---

## 🚀 Guide d'Installation & Démarrage

### 1. Prérequis
- **Docker** & **Docker Compose**
- **Node.js** v20+ et **npm**
- **Python** 3.11+ (pour exécuter l'IA en local hors Docker)

### 2. Configuration des Variables d'Environnement
```bash
cp .env.example .env
```

### 3. Démarrer les Services d'Infrastructure
```bash
docker compose up -d
```
Les conteneurs lancés :
- `tunijobs_postgres` : Port `5434` (mappé vers Postgres 5432)
- `tunijobs_redis` : Port `6379`
- `tunijobs_minio` : Port `9000` (API S3) et `9001` (Console Web UI)

### 4. Initialisation de la Base de Données & Seed
```bash
cd packages/database
npx prisma generate
npx prisma db push
npx ts-node prisma/seed/seed.ts
cd ../..
```

### 5. Démarrage des Services de l'Application

#### Backend NestJS :
```bash
cd apps/api
npm install
npm run build
npm run start:prod
# API disponible sur http://localhost:4000/api/v1
# Swagger sur http://localhost:4000/api/docs
```

#### Microservice IA Python FastAPI :
```bash
cd apps/ai-service
python -m venv venv
# Activer le venv et installer :
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
# Docs OpenAPI sur http://localhost:8000/docs
```

#### Frontend Next.js 14 :
```bash
cd apps/web
npm install
npm run build
npm run start
# Interface Web disponible sur http://localhost:3000
```

---

## 🔑 Identifiants de Démonstration (Seed Réaliste)

| Profil | Email | Mot de passe | Description |
| :--- | :--- | :--- | :--- |
| **Administrateur** | `admin@tunijobs.tn` | `Tunisia2026!` | Modération des entreprises RNE, audit de sécurité, stats nationales |
| **Recruteur (Lac 2)** | `rh@vermeg.com` | `Tunisia2026!` | Vermeg Tunisie (Édition logicielle), pipeline Kanban & offres Cloud |
| **Recruteur (Sfax)** | `rh@telnet.tn` | `Tunisia2026!` | Telnet Holding, offres Systèmes Embarqués & SIVP |
| **Candidat** | `candidat@tunijobs.tn` | `Tunisia2026!` | Yassine Trabelsi (Full-Stack Dev, 3 ans exp, Tunis) |

---

## 🧪 Suites de Tests Automatisés (29/29 Passés)

### 1. Tests Unitaires Backend (Jest) — 14/14 Passés
Vérifie la validation des matricules fiscaux RNE, les numéros tunisiens, le JWT et le service d'administration :
```bash
cd apps/api
npm test
```

### 2. Tests Unitaires Microservice IA (Pytest) — 8/8 Passés
Vérifie l'extraction de la taxonomie ESCO, les embeddings 768d et le calcul du score de similarité hybride :
```bash
cd apps/ai-service
python -m pytest tests -v
```

### 3. Tests End-to-End (Playwright) — 7/7 Passés
Valide l'expérience utilisateur complète sur navigateur Chromium headless :
```bash
cd apps/web
npx playwright test
```
**Scénarios E2E validés :**
1. `Accueil & Navigation` : Titre, liens de navigation, widgets de recherche.
2. `Exploration & Filtres` : Recherche multi-critères, badges des contrats (CDI/SIVP).
3. `Fiche d'Offre & SEO` : Recommandations IA, salaire en TND, métadonnées `schema.org/JobPosting`.
4. `Carte Interactive` : Choroplèthe des 24 gouvernorats, géolocalisation "Près de moi".
5. `Diagnostic IA de CV` : Parsing structuré, normalisation ESCO, consentement INPDP, matching prédictif.
6. `Pipeline Recruteur Kanban` : 5 colonnes de candidatures (Reçues, Présélection, Entretiens, Offres faites, Refusées).
7. `Administration & Sécurité` : Modération RNE, surveillance des offres et journal d'audit immuable.

---

## 🛡️ Sécurité & Durcissement (Phase 6)

- **Helmet** : Protection HTTP contre le clickjacking (`X-Frame-Options: SAMEORIGIN`), sniffing MIME (`X-Content-Type-Options: nosniff`) et forçage SSL (`Strict-Transport-Security`).
- **Throttler Rate Limiting** : Protection contre le scraping et les attaques par force brute (120 req/minute avec en-têtes `X-RateLimit-*`).
- **Export & Droit à l'Oubli (INPDP)** :
  - `GET /api/v1/candidates/export-data` : Export JSON complet de toutes les données du candidat.
  - `DELETE /api/v1/candidates/account` : Suppression définitive en cascade avec conformité juridique.
- **Audit Logs** : Traçabilité des actions sensibles stockées en base avec horodatage et adresse IP.
- **Données Structurées SEO** : Balisage `JobPosting` JSON-LD sur chaque offre, `sitemap.xml` et `robots.txt` dynamiques.

---

## 📦 Déploiement en Production (Docker Multi-Conteneurs)

Pour déployer l'intégralité de la plateforme TuniJobs en un seul clic :
```bash
docker compose -f docker-compose.prod.yml up -d --build
```
Cette commande compile et démarre :
- Base de données PostgreSQL + PostGIS + pgvector
- Cache Redis
- Serveur S3 MinIO
- Microservice IA FastAPI
- API REST NestJS
- Frontend Next.js 14
