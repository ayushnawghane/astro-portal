import 'dotenv/config';
import * as bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import { ZODIAC_SIGNS } from '../common/zodiac-signs.js';

// Dev-only seed credentials — never used in production, only to make the
// seeded demo accounts loggable-into for local testing.
const DEMO_ASTROLOGER_PASSWORD = 'astrologer123';
const DEMO_ADMIN_PASSWORD = 'admin123456';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function todayUTC() {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

const SAMPLE_TEXT: Record<string, string> = {
  aries: 'A burst of energy pushes you to start something you have been putting off. Trust your instincts in the morning, but slow down before committing to big decisions in the evening.',
  taurus: 'Financial matters take center stage today. A patient, practical approach pays off — avoid impulsive purchases and focus on long-term stability.',
  gemini: 'Communication flows easily today, making it a good time for important conversations. Stay open to new ideas from unexpected sources.',
  cancer: 'Family and home matters need your attention. Emotional sensitivity is high — use it to connect deeply rather than to worry.',
  leo: 'Your natural confidence shines today, drawing others toward your ideas. A creative project benefits from bold, decisive action.',
  virgo: 'Attention to detail serves you well at work. A methodical approach to a nagging problem finally uncovers the solution.',
  libra: 'Relationships are highlighted today. Seek balance in your commitments, and don\'t be afraid to say no to maintain harmony.',
  scorpio: 'Intense focus helps you push through a challenging task. Trust the process even when progress feels slow.',
  sagittarius: 'A sense of adventure calls — consider learning something new or planning a trip. Optimism helps you win others over.',
  capricorn: 'Discipline pays off today as steady effort moves an important goal forward. Recognition for past work may arrive unexpectedly.',
  aquarius: 'Innovative thinking sets you apart today. Collaborate with others who share your vision for the best results.',
  pisces: 'Intuition is strong — trust your gut on a decision you have been deliberating. Make time for rest and creative pursuits.',
};

async function main() {
  const date = todayUTC();

  console.log('Seeding daily horoscopes...');
  for (const sign of ZODIAC_SIGNS) {
    await prisma.horoscope.upsert({
      where: { zodiacSign_type_date: { zodiacSign: sign, type: 'DAILY', date } },
      create: {
        zodiacSign: sign,
        type: 'DAILY',
        date,
        content: SAMPLE_TEXT[sign],
        luckyColor: 'Blue',
        luckyNumber: String(Math.ceil(Math.random() * 9)),
        luckyTime: '10:00 AM - 12:00 PM',
        luckyDirection: 'East',
        luckyGemstone: 'Pearl',
      },
      update: {
        content: SAMPLE_TEXT[sign],
      },
    });
  }

  console.log('Seeding Panchang for New Delhi...');
  await prisma.panchang.upsert({
    where: { date_location: { date, location: 'New Delhi' } },
    create: {
      date,
      location: 'New Delhi',
      latitude: 28.6139,
      longitude: 77.209,
      tithi: 'Shukla Panchami',
      nakshatra: 'Rohini',
      yoga: 'Siddha',
      karana: 'Balava',
      sunrise: new Date(`${date.toISOString().slice(0, 10)}T06:12:00Z`),
      sunset: new Date(`${date.toISOString().slice(0, 10)}T18:05:00Z`),
      rahuKaal: '07:30 AM - 09:00 AM',
      gulikaKaal: '10:30 AM - 12:00 PM',
      yamaganda: '01:30 PM - 03:00 PM',
    },
    update: {},
  });

  console.log('Seeding upcoming Shubh Muhurat entries...');
  const muhurats: { activityType: string; daysAhead: number; title: string; description: string }[] = [
    { activityType: 'marriage', daysAhead: 12, title: 'Vivah Muhurat', description: 'Auspicious window for marriage ceremonies.' },
    { activityType: 'griha-pravesh', daysAhead: 5, title: 'Griha Pravesh Muhurat', description: 'Auspicious window for housewarming ceremonies.' },
    { activityType: 'vehicle-purchase', daysAhead: 3, title: 'Vehicle Purchase Muhurat', description: 'Auspicious window for buying a new vehicle.' },
  ];
  for (const m of muhurats) {
    const muhuratDate = new Date(date);
    muhuratDate.setUTCDate(muhuratDate.getUTCDate() + m.daysAhead);
    await prisma.shubhMuhurat.upsert({
      where: { activityType_date: { activityType: m.activityType, date: muhuratDate } },
      create: {
        activityType: m.activityType,
        date: muhuratDate,
        title: m.title,
        description: m.description,
        timings: [
          { start: '06:15', end: '07:45', quality: 'Best' },
          { start: '11:00', end: '12:30', quality: 'Good' },
        ],
      },
      update: {},
    });
  }

  console.log('Seeding sample blog & education content...');
  await prisma.content.upsert({
    where: { slug: 'understanding-your-moon-sign' },
    create: {
      category: 'EDUCATION',
      slug: 'understanding-your-moon-sign',
      title: 'Understanding Your Moon Sign',
      summary: 'Why your Rashi (Moon sign) matters as much as your Sun sign in Vedic astrology.',
      body: 'In Vedic astrology, the Moon sign (Rashi) reflects your emotional nature and inner mind, and is traditionally considered more important than the Sun sign for daily predictions like horoscopes and dashas...',
      tags: ['basics', 'moon-sign', 'rashi'],
      isPublished: true,
      publishedAt: new Date(),
    },
    update: {},
  });
  await prisma.content.upsert({
    where: { slug: 'five-tips-for-your-first-consultation' },
    create: {
      category: 'BLOG',
      slug: 'five-tips-for-your-first-consultation',
      title: 'Five Tips for Your First Astrology Consultation',
      summary: 'Get the most out of your first chat with an astrologer with these simple tips.',
      body: 'Your first consultation can feel overwhelming. Here are five tips: 1) Have your exact birth time and place ready. 2) Come with 2-3 clear questions. 3) Be open and honest. 4) Take notes. 5) Follow up on remedies suggested...',
      tags: ['tips', 'consultation'],
      isPublished: true,
      publishedAt: new Date(),
    },
    update: {},
  });

  console.log('Seeding a demo approved astrologer...');
  const demoEmail = 'demo.astrologer@example.com';
  const astrologerPasswordHash = await bcrypt.hash(DEMO_ASTROLOGER_PASSWORD, 10);
  await prisma.user.upsert({
    where: { email: demoEmail },
    create: {
      email: demoEmail,
      passwordHash: astrologerPasswordHash,
      role: 'ASTROLOGER',
      isEmailVerified: true,
      wallet: { create: { balance: 0 } },
      astrologer: {
        create: {
          displayName: 'Pandit Ramesh Shastri',
          bio: 'Vedic astrologer with two decades of experience in birth chart analysis, career guidance, and matchmaking.',
          experienceYears: 20,
          languages: ['English', 'Hindi'],
          expertise: ['Vedic Astrology', 'Career', 'Matchmaking'],
          pricePerMinuteChat: 15,
          pricePerMinuteVoice: 20,
          badge: 'EXPERT',
          onboardingStage: 'ACTIVE',
          isApproved: true,
          isAvailable: true,
        },
      },
    },
    update: { passwordHash: astrologerPasswordHash },
  });
  console.log(`  Login: ${demoEmail} / ${DEMO_ASTROLOGER_PASSWORD}`);

  console.log('Seeding a demo admin user...');
  const adminEmail = 'admin@example.com';
  const adminPasswordHash = await bcrypt.hash(DEMO_ADMIN_PASSWORD, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isEmailVerified: true,
      wallet: { create: { balance: 0 } },
    },
    update: { passwordHash: adminPasswordHash, role: 'ADMIN' },
  });
  console.log(`  Login: ${adminEmail} / ${DEMO_ADMIN_PASSWORD}`);

  console.log('Done.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
