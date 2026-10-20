import { test, expect } from '@playwright/test';

test.describe('TuniJobs - Plateforme de Recrutement Intelligente', () => {

  test('1. Page d\'accueil et navigation globale', async ({ page }) => {
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

  test('3. Détail d\'une offre et score IA explicable', async ({ page }) => {
    await page.goto('/offres/architecte-cloud-aws-and-devops-11-vnz1n');

    // Vérifier le titre de l'offre
    await expect(page.locator('h1')).toContainText('Architecte Cloud AWS & DevOps');

    // Vérifier la présence de l'entreprise et gouvernorat
    await expect(page.locator('h4', { hasText: 'Vermeg Tunisie' })).toBeVisible();
    await expect(page.locator('text=Tunis').first()).toBeVisible();

    // Vérifier la devise en TND
    await expect(page.locator('text=TND').first()).toBeVisible();

    // Vérifier le bouton pour postuler en 1 clic
    await expect(page.locator('button:has-text("Postuler en 1 clic")')).toBeVisible();

    // Vérifier les métadonnées SEO JobPosting JSON-LD
    const jsonLdScript = await page.locator('script[type="application/ld+json"]').textContent();
    expect(jsonLdScript).toContain('JobPosting');
    expect(jsonLdScript).toContain('Vermeg Tunisie');
  });

  test('4. Carte interactive de la Tunisie (/carte)', async ({ page }) => {
    await page.goto('/carte');

    // Vérifier le badge d'instruction de la carte
    await expect(
      page.locator('text=Cliquez sur l\'un des 24 gouvernorats pour explorer les offres locales')
    ).toBeVisible();

    // Vérifier les boutons d'outils cartographiques
    await expect(page.locator('button:has-text("Près de moi")')).toBeVisible();
  });

  test('5. Analyseur intelligent de CV avec IA (/ia-cv)', async ({ page }) => {
    await page.goto('/ia-cv');

    // Vérifier l'en-tête du module IA
    await expect(page.locator('h1')).toContainText('Diagnostic IA de votre CV');

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

  test('6. Pipeline Recruteur et tableau Kanban (/recruteur/pipeline)', async ({ page }) => {
    await page.goto('/recruteur/pipeline');

    // Vérifier l'espace recruteur
    await expect(page.locator('h1')).toContainText('Sélectionnez une offre pour ouvrir le Pipeline Kanban');

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

  test('7. Espace Administrateur et conformité RNE (/admin)', async ({ page }) => {
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

});
