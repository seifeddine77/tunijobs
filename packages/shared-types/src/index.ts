// ==========================================
// TUNIJOBS - Shared Types & Tunisian Constants
// ==========================================

export enum UserRole {
  CANDIDATE = 'CANDIDATE',
  RECRUITER = 'RECRUITER',
  ADMIN = 'ADMIN',
}

export enum ContractType {
  CDI = 'CDI',
  CDD = 'CDD',
  SIVP = 'SIVP',
  KARAMA = 'KARAMA',
  STAGE = 'STAGE',
  FREELANCE = 'FREELANCE',
}

export enum WorkMode {
  ON_SITE = 'ON_SITE',
  HYBRID = 'HYBRID',
  REMOTE = 'REMOTE',
}

export enum OfferStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  EXPIRED = 'EXPIRED',
  CLOSED = 'CLOSED',
}

export enum CompanyStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ApplicationStatus {
  RECEIVED = 'RECEIVED',
  SCREENED = 'SCREENED',
  INTERVIEW = 'INTERVIEW',
  OFFER = 'OFFER',
  REJECTED = 'REJECTED',
}

// ------------------------------------------
// Tunisian Geographic Definitions (24 Gouvernorats)
// ------------------------------------------

export interface GovernorateInfo {
  code: string;
  nameFr: string;
  nameAr: string;
  nameEn: string;
  region: 'Grand Tunis' | 'Nord-Est' | 'Nord-Ouest' | 'Centre-Est' | 'Centre-Ouest' | 'Sud-Est' | 'Sud-Ouest';
  centerLat: number;
  centerLng: number;
  delegations: string[];
}

export const TUNISIAN_GOVERNORATES: GovernorateInfo[] = [
  {
    code: '11',
    nameFr: 'Tunis',
    nameAr: 'تونس',
    nameEn: 'Tunis',
    region: 'Grand Tunis',
    centerLat: 36.8065,
    centerLng: 10.1815,
    delegations: ['Tunis Médina', 'Bab El Bhar', 'Bab Souika', 'El Omrane', 'El Omrane Supérieur', 'El Menzah', 'Cité El Khadra', 'Le Bardo', 'El Kram', 'La Goulette', 'La Marsa', 'Sidi Bou Saïd', 'Carthage'],
  },
  {
    code: '12',
    nameFr: 'Ariana',
    nameAr: 'أريانة',
    nameEn: 'Ariana',
    region: 'Grand Tunis',
    centerLat: 36.8665,
    centerLng: 10.1647,
    delegations: ['Ariana Ville', 'La Soukra', 'Raoued', 'Kalâat el-Andalous', 'Sidi Thabet', 'Mnihla', 'Ettadhamen'],
  },
  {
    code: '13',
    nameFr: 'Ben Arous',
    nameAr: 'بن عروس',
    nameEn: 'Ben Arous',
    region: 'Grand Tunis',
    centerLat: 36.7531,
    centerLng: 10.2189,
    delegations: ['Ben Arous', 'Bou Mhel el-Bassatine', 'El Mourouj', 'Ezzahra', 'Hammam Chott', 'Hammam Lif', 'Megrine', 'Mohamedia', 'Mornag', 'Radès'],
  },
  {
    code: '14',
    nameFr: 'Manouba',
    nameAr: 'منوبة',
    nameEn: 'Manouba',
    region: 'Grand Tunis',
    centerLat: 36.8081,
    centerLng: 10.0972,
    delegations: ['Manouba', 'Den Den', 'Douar Hicher', 'Oued Ellil', 'Tébourba', 'Djedeida', 'El Batan', 'Borj El Amri'],
  },
  {
    code: '17',
    nameFr: 'Bizerte',
    nameAr: 'بنزرت',
    nameEn: 'Bizerte',
    region: 'Nord-Est',
    centerLat: 37.2744,
    centerLng: 9.8739,
    delegations: ['Bizerte Nord', 'Bizerte Sud', 'Zarzouna', 'Menzel Bourguiba', 'Mateur', 'Ras Jebel', 'Ghar El Melh'],
  },
  {
    code: '21',
    nameFr: 'Nabeul',
    nameAr: 'نابل',
    nameEn: 'Nabeul',
    region: 'Nord-Est',
    centerLat: 36.4561,
    centerLng: 10.7376,
    delegations: ['Nabeul', 'Hammamet', 'Dar Chaâbane El Fehri', 'Béni Khiar', 'Korba', 'Menzel Temime', 'Kelibia', 'Grombalia', 'Soliman'],
  },
  {
    code: '22',
    nameFr: 'Zaghouan',
    nameAr: 'زغوان',
    nameEn: 'Zaghouan',
    region: 'Nord-Est',
    centerLat: 36.4029,
    centerLng: 10.1429,
    delegations: ['Zaghouan', 'Zriba', 'Bir Mcherga', 'El Fahs', 'Nadhour', 'Saouaf'],
  },
  {
    code: '31',
    nameFr: 'Béja',
    nameAr: 'باجة',
    nameEn: 'Beja',
    region: 'Nord-Ouest',
    centerLat: 36.7256,
    centerLng: 9.1817,
    delegations: ['Béja Nord', 'Béja Sud', 'Amdoun', 'Nefza', 'Téboursouk', 'Testour', 'Medjez el-Bab'],
  },
  {
    code: '32',
    nameFr: 'Jendouba',
    nameAr: 'جندوبة',
    nameEn: 'Jendouba',
    region: 'Nord-Ouest',
    centerLat: 36.5011,
    centerLng: 8.7802,
    delegations: ['Jendouba', 'Jendouba Nord', 'Bousalem', 'Tabarka', 'Aïn Draham', 'Fernana', 'Ghardimaou'],
  },
  {
    code: '33',
    nameFr: 'Le Kef',
    nameAr: 'الكاف',
    nameEn: 'El Kef',
    region: 'Nord-Ouest',
    centerLat: 36.1742,
    centerLng: 8.7049,
    delegations: ['Kef Ouest', 'Kef Est', 'Dahmani', 'Tajerouine', 'Sakiet Sidi Youssef', 'Sers', 'Kalâat Khasba'],
  },
  {
    code: '34',
    nameFr: 'Siliana',
    nameAr: 'سليانة',
    nameEn: 'Siliana',
    region: 'Nord-Ouest',
    centerLat: 36.0850,
    centerLng: 9.3708,
    delegations: ['Siliana Nord', 'Siliana Sud', 'Bou Arada', 'Gaâfour', 'El Krib', 'Makthar', 'Rouhia'],
  },
  {
    code: '41',
    nameFr: 'Kairouan',
    nameAr: 'القيروان',
    nameEn: 'Kairouan',
    region: 'Centre-Ouest',
    centerLat: 35.6781,
    centerLng: 10.0963,
    delegations: ['Kairouan Nord', 'Kairouan Sud', 'Chebika', 'Sbikha', 'Oueslatia', 'Haffouz', 'Nasrallah', 'Bou Hajla'],
  },
  {
    code: '42',
    nameFr: 'Kasserine',
    nameAr: 'القصرين',
    nameEn: 'Kasserine',
    region: 'Centre-Ouest',
    centerLat: 35.1676,
    centerLng: 8.8365,
    delegations: ['Kasserine Nord', 'Kasserine Sud', 'Sbeïtla', 'Fériana', 'Thala', 'Hassi El Ferid', 'Majel Bel Abbès'],
  },
  {
    code: '43',
    nameFr: 'Sidi Bouzid',
    nameAr: 'سيدي بوزيد',
    nameEn: 'Sidi Bouzid',
    region: 'Centre-Ouest',
    centerLat: 35.0382,
    centerLng: 9.4849,
    delegations: ['Sidi Bouzid Ouest', 'Sidi Bouzid Est', 'Jilma', 'Bir El Hafey', 'Regueb', 'Menzel Bouzaiane'],
  },
  {
    code: '51',
    nameFr: 'Sousse',
    nameAr: 'سوسة',
    nameEn: 'Sousse',
    region: 'Centre-Est',
    centerLat: 35.8256,
    centerLng: 10.6369,
    delegations: ['Sousse Ville', 'Sousse Riadh', 'Sousse Jaouhara', 'Hammam Sousse', 'Akouda', 'Kalâa Kebira', 'Kalâa Seghira', 'Msaken', 'Enfidha', 'Bouficha'],
  },
  {
    code: '52',
    nameFr: 'Monastir',
    nameAr: 'المنستير',
    nameEn: 'Monastir',
    region: 'Centre-Est',
    centerLat: 35.7779,
    centerLng: 10.8262,
    delegations: ['Monastir', 'Sahline', 'Ksar Hellal', 'Moknine', 'Téboulba', 'Jemmal', 'Bekalta', 'Sayada-Lamta-Bou Hjar'],
  },
  {
    code: '53',
    nameFr: 'Mahdia',
    nameAr: 'المهدية',
    nameEn: 'Mahdia',
    region: 'Centre-Est',
    centerLat: 35.5047,
    centerLng: 11.0622,
    delegations: ['Mahdia', 'Rejiche', 'Ksour Essef', 'Chebba', 'El Jem', 'Bou Merdes', 'Souassi'],
  },
  {
    code: '61',
    nameFr: 'Sfax',
    nameAr: 'صفاقس',
    nameEn: 'Sfax',
    region: 'Centre-Est',
    centerLat: 34.7406,
    centerLng: 10.7603,
    delegations: ['Sfax Ville', 'Sfax Ouest', 'Sfax Sud', 'Sakiet Ezzit', 'Sakiet Eddaïer', 'Thyna', 'Agareb', 'Jebiniana', 'El Hencha', 'Kerkennah', 'Mahrès'],
  },
  {
    code: '71',
    nameFr: 'Gafsa',
    nameAr: 'قفصة',
    nameEn: 'Gafsa',
    region: 'Sud-Ouest',
    centerLat: 34.4250,
    centerLng: 8.7842,
    delegations: ['Gafsa Ville', 'Gafsa Sud', 'El Ksar', 'Métlaoui', 'Redeyef', 'Moularès', 'Mdhilla', 'Sened'],
  },
  {
    code: '72',
    nameFr: 'Tozeur',
    nameAr: 'توزر',
    nameEn: 'Tozeur',
    region: 'Sud-Ouest',
    centerLat: 33.9197,
    centerLng: 8.1335,
    delegations: ['Tozeur', 'Degache', 'Nefta', 'Tameghza', 'Hazoua'],
  },
  {
    code: '73',
    nameFr: 'Kébili',
    nameAr: 'قبلي',
    nameEn: 'Kebili',
    region: 'Sud-Ouest',
    centerLat: 33.7044,
    centerLng: 8.9690,
    delegations: ['Kébili Sud', 'Kébili Nord', 'Souk Lahad', 'Douz Nord', 'Douz Sud', 'El Faouar'],
  },
  {
    code: '81',
    nameFr: 'Gabès',
    nameAr: 'قابس',
    nameEn: 'Gabes',
    region: 'Sud-Est',
    centerLat: 33.8815,
    centerLng: 10.0982,
    delegations: ['Gabès Ville', 'Gabès Ouest', 'Gabès Sud', 'Ghannouch', 'Métouia', 'Mareth', 'El Hamma', 'Matmata'],
  },
  {
    code: '82',
    nameFr: 'Médenine',
    nameAr: 'مدنين',
    nameEn: 'Medenine',
    region: 'Sud-Est',
    centerLat: 33.3549,
    centerLng: 10.5055,
    delegations: ['Médenine Nord', 'Médenine Sud', 'Zarzis', 'Djerba Houmt Souk', 'Djerba Midoun', 'Djerba Ajim', 'Ben Gardane', 'Beni Khedache'],
  },
  {
    code: '83',
    nameFr: 'Tataouine',
    nameAr: 'تطاوين',
    nameEn: 'Tataouine',
    region: 'Sud-Est',
    centerLat: 32.9297,
    centerLng: 10.4518,
    delegations: ['Tataouine Nord', 'Tataouine Sud', 'Ghomrassen', 'Bir Lahmar', 'Smâr', 'Remada', 'Dehiba'],
  },
];

// ------------------------------------------
// Validation Helpers (Tunisian formats)
// ------------------------------------------

// Matricule Fiscal TN (ex: 1234567/A/A/M/000 ou 1234567/A/B/000)
export const TN_TAX_ID_REGEX = /^\d{7}[A-Z]\/[A-Z]\/[A-Z]\/\d{3}$/;

// Numéro de téléphone tunisien (+216 2x, 4x, 5x, 7x, 9x)
export const TN_PHONE_REGEX = /^(?:\+216|00216)?[24579]\d{7}$/;

export function isValidTunisianPhone(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s.-]/g, '');
  return TN_PHONE_REGEX.test(cleaned);
}

export function isValidTunisianTaxId(taxId: string): boolean {
  if (!taxId) return false;
  return TN_TAX_ID_REGEX.test(taxId.trim());
}

export function formatTND(amount: number): string {
  return new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: 'TND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(amount);
}
