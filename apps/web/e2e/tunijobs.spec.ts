import { test, expect } from '@playwright/test';

test.describe('TuniJobs - Validation Intégrale de Toutes les Pages & Notifications', () => {

  test('1. Page d\'accueil et navigation globale (/)', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/TuniJobs/);

    // Vérifier les éléments clés du héros
    const heading = page.locator('h1');
    await expect(heading).toContainText("Trouvez l'emploi idéal");

    // Vérifier les liens de navigation
    await expect(page.locator('a[href="/offres"]').first()).toBeVisible();
    await expect(page.locator('a[href="/carte"]').first()).toBeVisible();
    await expect(page.locator('a[href="/ia-cv"]').first()).toBeVisible();
    await expect(page.locator('a[href="/recruteur/pipeline"]').first()).toBeVisible();
    await expect(page.locator('a[href="/admin"]').first()).toBeVisible();
  });

  test('2. Exploration des offres et recherche multi-critères (/offres)', async ({ page }) => {
    await page.goto('/offres');

    // Vérifier le titre de la section offres
    await expect(page.getByRole('heading', { name: "Offres d'emploi en Tunisie" })).toBeVisible();

    // Vérifier la présence de cartes d'offres
    const jobCards = page.locator('a[href^="/offres/"]');
    await expect(jobCards.first()).toBeVisible();

    // Vérifier la présence de filtres de recherche
    await expect(page.locator('h3:has-text("Filtres de recherche")')).toBeVisible();
  });

  test('3. Détail d\'une offre, salaire TND et score IA (/offres/[slug])', async ({ page }) => {
    await page.goto('/offres/architecte-cloud-aws-and-devops-11-vnz1n');

    // Vérifier le titre de l'offre
    await expect(page.locator('h1')).toContainText('Architecte Cloud AWS & DevOps');

    // Vérifier l'entreprise et la devise
    await expect(page.locator('h4', { hasText: 'Vermeg Tunisie' })).toBeVisible();
    await expect(page.locator('text=Tunis').first()).toBeVisible();
    await expect(page.locator('text=TND').first()).toBeVisible();

    // Vérifier le bouton pour postuler en 1 clic
    await expect(page.locator('button:has-text("Postuler en 1 clic")')).toBeVisible();

    // Vérifier les métadonnées SEO Schema.org JobPosting
    const jsonLdScript = await page.locator('script[type="application/ld+json"]').textContent();
    expect(jsonLdScript).toContain('JobPosting');
    expect(jsonLdScript).toContain('Vermeg Tunisie');
  });

  test('4. Carte interactive avec cercles d\'offres au clic (/carte)', async ({ page }) => {
    await page.goto('/carte');

    // Vérifier l'instruction de la carte
    await expect(
      page.locator('text=Cliquez sur l\'un des 24 gouvernorats pour explorer les offres locales')
    ).toBeVisible();

    // Vérifier les boutons d'outils cartographiques
    await expect(page.locator('button:has-text("Près de moi")')).toBeVisible();
    await expect(page.locator('button:has-text("Choroplèthe")')).toBeVisible();

    // Vérifier la présence du canvas MapLibre
    await expect(page.locator('canvas.maplibregl-canvas')).toBeVisible({ timeout: 10000 });
  });

  test('5. Module IA avec OCR de CV (/ia-cv)', async ({ page }) => {
    await page.goto('/ia-cv');

    // Vérifier l'en-tête du module IA
    await expect(page.locator('h1')).toContainText('Diagnostic IA de votre CV');

    // Vérifier la présence du bouton d'import OCR
    await expect(page.locator('text=Importer CV (PDF/Image OCR)')).toBeVisible();

    // Remplir la zone de texte avec un profil tunisien réaliste
    const cvInput = page.locator('textarea');
    await cvInput.fill(`Ahmed Ben Salah
Ingénieur DevOps & Cloud Senior
Tunis, Tunisie | +216 22 123 456
Compétences: Docker, Kubernetes, AWS, Terraform, CI/CD, Linux, Python
Expérience: 5 ans en conception d'infrastructures hautement disponibles et sécurisées.`);

    // Cocher le consentement INPDP obligatoire
    await page.locator('#gdpr').check();

    // Lancer l'analyse IA
    const submitBtn = page.locator('button:has-text("Lancer le diagnostic IA")');
    await submitBtn.click();

    // Attendre l'extraction des compétences et l'étape de scoring prédictif
    await expect(page.locator('text=Étape 1 · Extraction structurée')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Étape 2 · Recommandations personnalisées')).toBeVisible({ timeout: 15000 });
  });

  test('6. Assistant RAG Intelligent en langage naturel (/ia-cv - Onglet RAG)', async ({ page }) => {
    await page.goto('/ia-cv');

    // Basculer vers l'onglet RAG
    const ragTabBtn = page.locator('button:has-text("Assistant RAG Tunisie")');
    await expect(ragTabBtn).toBeVisible();
    await ragTabBtn.click();

    // Vérifier l'en-tête de l'assistant RAG
    await expect(page.locator('text=Interrogez le marché de l\'emploi en langage naturel (RAG)')).toBeVisible();

    // Poser une question au RAG via les suggestions
    const suggestionBtn = page.locator('button:has-text("Quels postes DevOps ou Cloud sont disponibles à Tunis ?")');
    await expect(suggestionBtn).toBeVisible();
    await suggestionBtn.click();

    // Attendre la réponse synthétisée avec les sources documentaires
    await expect(page.locator('text=Réponse synthétisée par RAG')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Sources documentaires extraites')).toBeVisible();
  });

  test('7. Suivi des candidatures du candidat (/candidat/candidatures)', async ({ page }) => {
    await page.goto('/candidat/candidatures');

    // Vérifier l'en-tête de l'espace candidat
    await expect(page.locator('h1')).toContainText('Suivi de mes candidatures');

    // Vérifier les boutons d'onglets de filtres et la liste des candidatures
    await expect(page.locator('button:has-text("Toutes")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Vermeg Tunisie').first()).toBeVisible({ timeout: 10000 });
  });

  test('8. Centre de notifications en temps réel BullMQ (/notifications)', async ({ page }) => {
    await page.goto('/notifications');

    // Vérifier la présence du centre de notifications
    await expect(page.locator('h1')).toContainText('Centre de notifications');

    // Vérifier le bouton de marquage
    await expect(page.locator('button:has-text("Tout marquer comme lu")')).toBeVisible();
  });

  test('9. Pipeline Recruteur et tableau Kanban (/recruteur/pipeline)', async ({ page }) => {
    await page.goto('/recruteur/pipeline');

    // Vérifier l'espace recruteur
    await expect(page.locator('h1')).toContainText('Pipeline Kanban de Recrutement');

    // Attendre l'affichage des offres de l'entreprise
    const kanbanLink = page.locator('a:has-text("Ouvrir le Kanban")').first();
    await expect(kanbanLink).toBeVisible({ timeout: 10000 });
    await kanbanLink.click();

    // Vérifier les 5 colonnes Kanban
    await expect(page.locator('span:has-text("Reçues")').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('span:has-text("Présélection")').first()).toBeVisible();
    await expect(page.locator('span:has-text("Entretiens")').first()).toBeVisible();
    await expect(page.locator('span:has-text("Offres faites")').first()).toBeVisible();
    await expect(page.locator('span:has-text("Refusées")').first()).toBeVisible();
  });

  test('10. Espace Administrateur, modération RNE et audit logs (/admin)', async ({ page }) => {
    await page.goto('/admin');

    // Vérifier le tableau de bord administrateur
    await expect(page.locator('h1')).toContainText('Tableau de bord Administrateur');

    // Vérifier les 4 onglets
    await expect(page.locator('button:has-text("Vue générale")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("Entreprises")')).toBeVisible();
    await expect(page.locator('button:has-text("Utilisateurs")')).toBeVisible();
    await expect(page.locator('button:has-text("Journal d\'audit")')).toBeVisible();

    // Cliquer sur le journal d'audit
    await page.locator('button:has-text("Journal d\'audit")').click();
    await expect(page.locator('text=Journal d\'audit des actions sensibles')).toBeVisible({ timeout: 10000 });
  });

  test('11. Page de Connexion avec comptes démo 1-clic (/connexion)', async ({ page }) => {
    await page.goto('/connexion');

    await expect(page.locator('h1')).toContainText('Connexion à TuniJobs');
    await expect(page.locator('text=Connexion en 1 clic (Comptes Démo)')).toBeVisible();
    await expect(page.locator('button:has-text("Candidat")')).toBeVisible();
    await expect(page.locator('button:has-text("Recruteur")')).toBeVisible();
    await expect(page.locator('button:has-text("Admin")')).toBeVisible();
  });

  test('12. Inscription avec toggle Candidat / Entreprise (/inscription)', async ({ page }) => {
    await page.goto('/inscription');

    await expect(page.locator('h1')).toContainText('Créer un compte TuniJobs');
    await expect(page.locator('button:has-text("Candidat")')).toBeVisible();
    await expect(page.locator('button:has-text("Entreprise / Recruteur")')).toBeVisible();
    await expect(page.locator('text=Loi tunisienne n° 2004-63 (INPDP)')).toBeVisible();
  });

  test('13. Profil Candidat et Conformité INPDP Loi 2004-63 (/candidat/profil)', async ({ page }) => {
    await page.goto('/candidat/profil');

    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Curriculum Vitae (Pièce Jointe Officielle)')).toBeVisible();
    await expect(page.locator('text=Télécharger / Ouvrir')).toBeVisible();
    await expect(page.locator('text=Protection des données (INPDP - Loi tunisienne n° 2004-63)')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("Exporter toutes mes données")')).toBeVisible();
    await expect(page.locator('button:has-text("Supprimer mon compte (Droit à l\'oubli)")')).toBeVisible();
  });

  test('14. Publication d\'une nouvelle offre Recruteur (/recruteur/offres/nouvelle)', async ({ page }) => {
    await page.goto('/recruteur/offres/nouvelle');

    await expect(page.locator('h1')).toContainText('Publier une nouvelle offre d\'emploi');
    await expect(page.locator('text=Gouvernorat (24 Régions de Tunisie)')).toBeVisible();
    await expect(page.locator('button:has-text("Rédiger avec l\'IA TuniJobs")')).toBeVisible();
    await expect(page.locator('button:has-text("Publier l\'offre d\'emploi")')).toBeVisible();
  });

  test('15. Module Scraper Automatique Web dans le Dashboard Admin (/admin)', async ({ page }) => {
    await page.goto('/admin');

    await expect(page.locator('text=Collecteur d\'Offres Web (Keejob / Tanitjobs)')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("Lancer la collecte automatique d\'offres web")')).toBeVisible();
  });

});
