import { PrismaClient, UserRole, ContractType, WorkMode, OfferStatus, CompanyStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const GOVERNORATES = [
  { code: '11', nameFr: 'Tunis', nameAr: 'تونس', nameEn: 'Tunis', centerLat: 36.8065, centerLng: 10.1815 },
  { code: '12', nameFr: 'Ariana', nameAr: 'أريانة', nameEn: 'Ariana', centerLat: 36.8665, centerLng: 10.1647 },
  { code: '13', nameFr: 'Ben Arous', nameAr: 'بن عروس', nameEn: 'Ben Arous', centerLat: 36.7531, centerLng: 10.2189 },
  { code: '14', nameFr: 'Manouba', nameAr: 'منوبة', nameEn: 'Manouba', centerLat: 36.8081, centerLng: 10.0972 },
  { code: '17', nameFr: 'Bizerte', nameAr: 'بنزرت', nameEn: 'Bizerte', centerLat: 37.2744, centerLng: 9.8739 },
  { code: '21', nameFr: 'Nabeul', nameAr: 'نابل', nameEn: 'Nabeul', centerLat: 36.4561, centerLng: 10.7376 },
  { code: '22', nameFr: 'Zaghouan', nameAr: 'زغوان', nameEn: 'Zaghouan', centerLat: 36.4029, centerLng: 10.1429 },
  { code: '31', nameFr: 'Béja', nameAr: 'باجة', nameEn: 'Beja', centerLat: 36.7256, centerLng: 9.1817 },
  { code: '32', nameFr: 'Jendouba', nameAr: 'جندوبة', nameEn: 'Jendouba', centerLat: 36.5011, centerLng: 8.7802 },
  { code: '33', nameFr: 'Le Kef', nameAr: 'الكاف', nameEn: 'El Kef', centerLat: 36.1742, centerLng: 8.7049 },
  { code: '34', nameFr: 'Siliana', nameAr: 'سليانة', nameEn: 'Siliana', centerLat: 36.0850, centerLng: 9.3708 },
  { code: '41', nameFr: 'Kairouan', nameAr: 'القيروان', nameEn: 'Kairouan', centerLat: 35.6781, centerLng: 10.0963 },
  { code: '42', nameFr: 'Kasserine', nameAr: 'القصرين', nameEn: 'Kasserine', centerLat: 35.1676, centerLng: 8.8365 },
  { code: '43', nameFr: 'Sidi Bouzid', nameAr: 'سيدي بوزيد', nameEn: 'Sidi Bouzid', centerLat: 35.0382, centerLng: 9.4849 },
  { code: '51', nameFr: 'Sousse', nameAr: 'سوسة', nameEn: 'Sousse', centerLat: 35.8256, centerLng: 10.6369 },
  { code: '52', nameFr: 'Monastir', nameAr: 'المنستير', nameEn: 'Monastir', centerLat: 35.7779, centerLng: 10.8262 },
  { code: '53', nameFr: 'Mahdia', nameAr: 'المهدية', nameEn: 'Mahdia', centerLat: 35.5047, centerLng: 11.0622 },
  { code: '61', nameFr: 'Sfax', nameAr: 'صفاقس', nameEn: 'Sfax', centerLat: 34.7406, centerLng: 10.7603 },
  { code: '71', nameFr: 'Gafsa', nameAr: 'قفصة', nameEn: 'Gafsa', centerLat: 34.4250, centerLng: 8.7842 },
  { code: '72', nameFr: 'Tozeur', nameAr: 'توزر', nameEn: 'Tozeur', centerLat: 33.9197, centerLng: 8.1335 },
  { code: '73', nameFr: 'Kébili', nameAr: 'قبلي', nameEn: 'Kebili', centerLat: 33.7044, centerLng: 8.9690 },
  { code: '81', nameFr: 'Gabès', nameAr: 'قابس', nameEn: 'Gabes', centerLat: 33.8815, centerLng: 10.0982 },
  { code: '82', nameFr: 'Médenine', nameAr: 'مدنين', nameEn: 'Medenine', centerLat: 33.3549, centerLng: 10.5055 },
  { code: '83', nameFr: 'Tataouine', nameAr: 'تطاوين', nameEn: 'Tataouine', centerLat: 32.9297, centerLng: 10.4518 },
];

const SKILLS = [
  'TypeScript', 'JavaScript', 'React', 'Next.js', 'NestJS', 'Node.js',
  'Python', 'FastAPI', 'Django', 'PostgreSQL', 'PostGIS', 'Docker',
  'Kubernetes', 'Redis', 'Tailwind CSS', 'GraphQL', 'AWS', 'Flutter',
  'Java', 'Spring Boot', 'PHP', 'Symfony', 'DevOps', 'CI/CD'
];

async function main() {
  console.log('🌱 Début du peuplement de la base de données TuniJobs...');

  // 1. Insertion des 24 gouvernorats
  console.log('📍 Insertion des 24 gouvernorats tunisiens...');
  for (const gov of GOVERNORATES) {
    await prisma.governorate.upsert({
      where: { code: gov.code },
      update: gov,
      create: gov,
    });
  }

  // 2. Insertion des compétences ESCO
  console.log('💡 Insertion des compétences clés...');
  for (const skillName of SKILLS) {
    await prisma.skill.upsert({
      where: { name: skillName },
      update: {},
      create: { name: skillName, category: 'Informatique & Tech' },
    });
  }

  // Mot de passe standard pour les tests: "Tunisia2026!"
  const passwordHash = await bcrypt.hash('Tunisia2026!', 10);

  // 3. Création Administrateur
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tunijobs.tn' },
    update: {},
    create: {
      email: 'admin@tunijobs.tn',
      passwordHash,
      role: UserRole.ADMIN,
      isEmailVerified: true,
      phone: '+216 71 100 000',
    },
  });
  console.log('👑 Admin créé:', admin.email);

  // 4. Création Recruteur & Entreprise (Vermeg Tunisie)
  const recruiterUser = await prisma.user.upsert({
    where: { email: 'rh@vermeg.com' },
    update: {},
    create: {
      email: 'rh@vermeg.com',
      passwordHash,
      role: UserRole.RECRUITER,
      isEmailVerified: true,
      phone: '+216 71 860 000',
    },
  });

  const companyVermeg = await prisma.company.upsert({
    where: { userId: recruiterUser.id },
    update: {},
    create: {
      userId: recruiterUser.id,
      name: 'Vermeg Tunisie',
      taxId: '1234567A/A/M/000',
      sector: 'Édition Logiciels Financiers',
      size: '500+ employés',
      website: 'https://www.vermeg.com',
      description: 'Leader dans les solutions logicielles dédiées à la finance et aux banques internationales.',
      status: CompanyStatus.APPROVED,
    },
  });
  console.log('🏢 Entreprise créée:', companyVermeg.name);

  // Deuxième entreprise (Telnet Sfax)
  const recruiterTelnet = await prisma.user.upsert({
    where: { email: 'rh@telnet.tn' },
    update: {},
    create: {
      email: 'rh@telnet.tn',
      passwordHash,
      role: UserRole.RECRUITER,
      isEmailVerified: true,
      phone: '+216 74 200 100',
    },
  });

  const companyTelnet = await prisma.company.upsert({
    where: { userId: recruiterTelnet.id },
    update: {},
    create: {
      userId: recruiterTelnet.id,
      name: 'Telnet Holding',
      taxId: '7654321B/B/M/000',
      sector: 'Ingénierie & Télécoms',
      size: '200-500 employés',
      website: 'https://www.groupe-telnet.net',
      description: 'Pionnier tunisien en R&D, ingénierie logicielle et aérospatiale.',
      status: CompanyStatus.APPROVED,
    },
  });
  console.log('🏢 Entreprise créée:', companyTelnet.name);

  // 5. Création Candidat
  const candidateUser = await prisma.user.upsert({
    where: { email: 'candidat@tunijobs.tn' },
    update: {},
    create: {
      email: 'candidat@tunijobs.tn',
      passwordHash,
      role: UserRole.CANDIDATE,
      isEmailVerified: true,
      phone: '+216 98 123 456',
    },
  });

  const candidateProfile = await prisma.candidateProfile.upsert({
    where: { userId: candidateUser.id },
    update: {},
    create: {
      userId: candidateUser.id,
      firstName: 'Yassine',
      lastName: 'Trabelsi',
      headline: 'Ingénieur Développeur Full-Stack TypeScript / Python',
      bio: 'Passionné par le développement moderne, les architectures distribuées et l’IA.',
      experienceYears: 3,
      currentSalary: 2200,
      expectedSalary: 2800,
      currency: 'TND',
      preferredGovernorates: ['11', '12', '13', '51'],
    },
  });
  console.log('👤 Candidat créé:', candidateProfile.firstName, candidateProfile.lastName);

  // 6. Création d'offres d'emploi tunisiennes réalistes
  const offersData = [
    {
      companyId: companyVermeg.id,
      title: 'Développeur Full-Stack NestJS & React',
      slug: 'developpeur-full-stack-nestjs-react-tunis',
      description: 'Nous recrutons un Ingénieur Fullstack passionné pour concevoir des plateformes financières robustes et évolutives.',
      requirements: 'Maîtrise de TypeScript, NestJS, React, PostgreSQL et Docker. Bon relationnel et esprit d’équipe.',
      contractType: ContractType.CDI,
      workMode: WorkMode.HYBRID,
      experienceLevel: 'Confirmé (2-4 ans)',
      salaryMin: 2400,
      salaryMax: 3200,
      currency: 'TND',
      status: OfferStatus.PUBLISHED,
      governorateCode: '11', // Tunis
      delegation: 'Les Berges du Lac 2',
      latitude: 36.8372,
      longitude: 10.2396,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      companyId: companyVermeg.id,
      title: 'Ingénieur DevOps & Cloud Kubernetes',
      slug: 'ingenieur-devops-cloud-kubernetes-tunis',
      description: 'Supervisez nos infrastructures CI/CD, clusters Kubernetes et automatisation Cloud.',
      requirements: 'Expérience avérée avec Docker, Kubernetes, Terraform, Prometheus/Grafana.',
      contractType: ContractType.CDI,
      workMode: WorkMode.HYBRID,
      experienceLevel: 'Senior (5+ ans)',
      salaryMin: 3200,
      salaryMax: 4500,
      currency: 'TND',
      status: OfferStatus.PUBLISHED,
      governorateCode: '11',
      delegation: 'Les Berges du Lac 2',
      latitude: 36.8372,
      longitude: 10.2396,
      expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    },
    {
      companyId: companyTelnet.id,
      title: 'Développeur Système Embarqué & C/C++',
      slug: 'developpeur-systeme-embarque-sfax',
      description: 'Participation à des projets innovants dans le domaine de la télématique automobile et avionique.',
      requirements: 'Bonne maîtrise du langage C/C++, Linux embarqué, protocoles de communication série/CAN.',
      contractType: ContractType.CDI,
      workMode: WorkMode.ON_SITE,
      experienceLevel: 'Junior / Confirmé',
      salaryMin: 1800,
      salaryMax: 2600,
      currency: 'TND',
      status: OfferStatus.PUBLISHED,
      governorateCode: '61', // Sfax
      delegation: 'Sfax Ville',
      latitude: 34.7406,
      longitude: 10.7603,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
    {
      companyId: companyTelnet.id,
      title: 'Développeur Mobile Flutter (Contrat SIVP)',
      slug: 'developpeur-mobile-flutter-sivp-sfax',
      description: 'Opportunité pour jeune diplômé éligible au contrat SIVP pour intégrer une équipe dynamique de développement mobile.',
      requirements: 'Diplôme d’ingénieur ou Master en informatique, projet académique sur Flutter/Dart.',
      contractType: ContractType.SIVP,
      workMode: WorkMode.ON_SITE,
      experienceLevel: 'Débutant / Premier emploi',
      salaryMin: 1200,
      salaryMax: 1500,
      currency: 'TND',
      status: OfferStatus.PUBLISHED,
      governorateCode: '61',
      delegation: 'Technopôle de Sfax',
      latitude: 34.7250,
      longitude: 10.7100,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      companyId: companyVermeg.id,
      title: 'Data Analyst & BI Specialist',
      slug: 'data-analyst-bi-specialist-ariana',
      description: 'Conception de tableaux de bord stratégiques, extraction et analyse de flux financiers.',
      requirements: 'Maîtrise de SQL, Python, Power BI ou Tableau, modélisation de données.',
      contractType: ContractType.CDD,
      workMode: WorkMode.HYBRID,
      experienceLevel: 'Confirmé (3 ans)',
      salaryMin: 2200,
      salaryMax: 2900,
      currency: 'TND',
      status: OfferStatus.PUBLISHED,
      governorateCode: '12', // Ariana
      delegation: 'El Ghazala Technopark',
      latitude: 36.8943,
      longitude: 10.1884,
      expiresAt: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
    },
  ];

  console.log('💼 Insertion des offres d’emploi initiales...');
  for (const offer of offersData) {
    await prisma.jobOffer.upsert({
      where: { slug: offer.slug },
      update: offer,
      create: offer,
    });
  }

  console.log('✅ Seed terminé avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
