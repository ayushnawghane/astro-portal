export interface AuthUser {
  id: string;
  email: string | null;
  phone: string | null;
  role: "USER" | "ASTROLOGER" | "ADMIN";
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

export type ProfileRelation = "SELF" | "SPOUSE" | "CHILD" | "PARENT" | "CUSTOM";
export type Gender = "MALE" | "FEMALE" | "OTHER";

export interface Profile {
  id: string;
  userId: string;
  relation: ProfileRelation;
  name: string;
  gender: Gender;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  createdAt: string;
}

export interface PlanetPosition {
  graha: string;
  longitude: number;
  rashi: string;
  degreeInRashi: number;
  nakshatra: string;
  nakshatraPada: number;
  house: number;
  isRetrograde: boolean;
}

export interface DashaPeriod {
  lord: string;
  startDate: string;
  endDate: string;
  years: number;
}

export interface DoshaResult {
  name: string;
  present: boolean;
  reason: string;
}

export type YogaResult = DoshaResult;

export interface KundliReport {
  id: string;
  profileId: string;
  chartData: {
    ascendant: { rashi: string; longitude: number; degreeInRashi: number };
    houses: { house: number; rashi: string }[];
    moonNakshatra: { name: string; pada: number };
  };
  planetaryPositions: PlanetPosition[];
  houseAnalysis: { house: number; rashi: string }[];
  dashaInfo: DashaPeriod[];
  doshas: DoshaResult[];
  yogas: YogaResult[];
  createdAt: string;
}

export type HoroscopeType = "YESTERDAY" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export interface Horoscope {
  id: string;
  zodiacSign: string;
  type: HoroscopeType;
  date: string;
  content: string;
  luckyColor: string | null;
  luckyNumber: string | null;
  luckyTime: string | null;
  luckyDirection: string | null;
  luckyGemstone: string | null;
}

export interface Panchang {
  id: string;
  date: string;
  location: string;
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  sunrise: string;
  sunset: string;
  rahuKaal: string;
  gulikaKaal: string;
  yamaganda: string;
}

export type AstrologerBadge = "NEW" | "VERIFIED" | "EXPERT" | "CELEBRITY";

export interface Astrologer {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  experienceYears: number;
  languages: string[];
  expertise: string[];
  pricePerMinuteChat: string;
  pricePerMinuteVoice: string | null;
  badge: AstrologerBadge;
  isApproved: boolean;
  isAvailable: boolean;
  ratingAvg: number;
  ratingCount: number;
}

export interface AstrologerReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface AstrologerWithReviews extends Astrologer {
  reviews: AstrologerReview[];
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: string;
  updatedAt: string;
}

export type WalletTxnType = "RECHARGE" | "DEBIT" | "REFUND" | "PROMOTION";

export interface WalletTransaction {
  id: string;
  type: WalletTxnType;
  amount: string;
  description: string | null;
  createdAt: string;
}

export type ConsultationType = "CHAT" | "VOICE";
export type ConsultationStatus = "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface Consultation {
  id: string;
  userId: string;
  astrologerId: string;
  type: ConsultationType;
  status: ConsultationStatus;
  isFreeSession: boolean;
  startedAt: string | null;
  endedAt: string | null;
  durationSeconds: number | null;
  amountCharged: string | null;
  createdAt: string;
  astrologer?: Astrologer;
  user?: { id: string; email: string | null; phone: string | null };
}

export interface MuhuratTiming {
  start: string;
  end: string;
  quality: string;
}

export interface ShubhMuhurat {
  id: string;
  activityType: string;
  date: string;
  title: string;
  description: string;
  timings: MuhuratTiming[];
}

export type ContentCategory = "BLOG" | "EDUCATION";

export interface ContentSummary {
  id: string;
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  coverImageUrl: string | null;
  publishedAt: string | null;
}

export interface ContentDetail extends ContentSummary {
  category: ContentCategory;
  body: string;
  isPublished: boolean;
  createdAt: string;
}

export interface NumerologyResult {
  lifePathNumber: number;
  lifePathMeaning: string;
  destinyNumber: number;
  destinyMeaning: string;
  soulUrgeNumber: number;
  soulUrgeMeaning: string;
}

export type WesternSign =
  | "Aries" | "Taurus" | "Gemini" | "Cancer" | "Leo" | "Virgo"
  | "Libra" | "Scorpio" | "Sagittarius" | "Capricorn" | "Aquarius" | "Pisces";

export interface ZodiacSignResult {
  sign: WesternSign;
  element: "Fire" | "Earth" | "Air" | "Water";
  rulingPlanet: string;
}

export interface ZodiacCompatibilityResult {
  score: number;
  description: string;
  elementA: string;
  elementB: string;
}

export interface TarotCard {
  position: string;
  name: string;
  reversed: boolean;
  meaning: string;
}

export interface Koota {
  name: string;
  score: number;
  maxScore: number;
  description: string;
}

export interface MatchResult {
  totalScore: number;
  maxScore: number;
  kootas: Koota[];
  verdict: string;
  mangalDosha: { groom: boolean; bride: boolean; compatible: boolean; note: string };
}

export interface AdminWalletTransaction {
  id: string;
  type: WalletTxnType;
  amount: string;
  description: string | null;
  createdAt: string;
  wallet: { user: { email: string | null; phone: string | null } };
}

export interface RevenueDashboard {
  totalUsers: number;
  approvedAstrologers: number;
  completedConsultations: number;
  totalConsultationRevenue: number;
  totalWalletRecharges: number;
}

export interface AdminUser {
  id: string;
  email: string | null;
  phone: string | null;
  role: "USER" | "ASTROLOGER" | "ADMIN";
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  consultationId: string;
  senderId: string;
  content: string;
  attachmentUrl: string | null;
  createdAt: string;
}
