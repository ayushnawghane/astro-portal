import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import sweph from 'sweph';
import { RASHIS, NAKSHATRAS, NAKSHATRA_SPAN_DEG, GRAHAS, VIMSHOTTARI_LORD_SEQUENCE, VIMSHOTTARI_PERIOD_YEARS } from './astrology.constants.js';
import type { AscendantInfo, BirthChartResult, DashaPeriod, DoshaResult, PlanetPosition, YogaResult } from './astrology.types.js';
import type { Graha } from './astrology.constants.js';

const PLANET_CODES: Record<Exclude<Graha, 'Ketu'>, number> = {
  Sun: sweph.constants.SE_SUN,
  Moon: sweph.constants.SE_MOON,
  Mercury: sweph.constants.SE_MERCURY,
  Venus: sweph.constants.SE_VENUS,
  Mars: sweph.constants.SE_MARS,
  Jupiter: sweph.constants.SE_JUPITER,
  Saturn: sweph.constants.SE_SATURN,
  Rahu: sweph.constants.SE_TRUE_NODE,
};

// Moshier semi-analytical ephemeris — accurate to a few arcseconds and needs
// no external .se1 data files, which is plenty for astrology-grade charts.
const CALC_FLAGS = sweph.constants.SEFLG_MOSEPH | sweph.constants.SEFLG_SIDEREAL | sweph.constants.SEFLG_SPEED;

function normalizeDegrees(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

// Sign indices (0=Aries..11=Pisces) where each Pancha Mahapurusha planet is
// either in its own sign or exalted — the classical condition for its yoga.
const MAHAPURUSHA_SIGNS: Record<'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn', { signs: number[]; yoga: string }> = {
  Mars: { signs: [0, 7, 9], yoga: 'Ruchaka Yoga' },
  Mercury: { signs: [2, 5], yoga: 'Bhadra Yoga' },
  Jupiter: { signs: [8, 11, 3], yoga: 'Hamsa Yoga' },
  Venus: { signs: [1, 6, 11], yoga: 'Malavya Yoga' },
  Saturn: { signs: [9, 10, 6], yoga: 'Sasha Yoga' },
};
const KENDRA_HOUSES = [1, 4, 7, 10];

function rashiFor(longitude: number) {
  const norm = normalizeDegrees(longitude);
  const index = Math.floor(norm / 30);
  return { rashi: RASHIS[index], degreeInRashi: norm - index * 30, signIndex: index };
}

function nakshatraFor(longitude: number) {
  const norm = normalizeDegrees(longitude);
  const index = Math.floor(norm / NAKSHATRA_SPAN_DEG);
  const withinNakshatra = norm - index * NAKSHATRA_SPAN_DEG;
  const pada = Math.floor(withinNakshatra / (NAKSHATRA_SPAN_DEG / 4)) + 1;
  return { name: NAKSHATRAS[index], pada, index };
}

@Injectable()
export class AstrologyCalculationService {
  constructor() {
    // Lahiri (Chitra Paksha) ayanamsa is the de facto standard for Vedic
    // astrology in India, matching the Nakshatra/Rahu Kaal terminology used
    // throughout this product.
    sweph.set_sid_mode(sweph.constants.SE_SIDM_LAHIRI, 0, 0);
  }

  /** Julian Day (UT) for a birth date/time given in a local IANA timezone. */
  julianDayUT(dateOfBirth: Date, timeOfBirth: string, timezone: string): number {
    const [hour, minute] = timeOfBirth.split(':').map(Number);
    const local = DateTime.fromObject(
      {
        year: dateOfBirth.getUTCFullYear(),
        month: dateOfBirth.getUTCMonth() + 1,
        day: dateOfBirth.getUTCDate(),
        hour,
        minute,
      },
      { zone: timezone || 'UTC' },
    );
    const utc = local.toUTC();
    const decimalHour = utc.hour + utc.minute / 60 + utc.second / 3600;
    return sweph.julday(utc.year, utc.month, utc.day, decimalHour, sweph.constants.SE_GREG_CAL);
  }

  computeBirthChart(dateOfBirth: Date, timeOfBirth: string, timezone: string, latitude: number, longitude: number): BirthChartResult {
    const jd = this.julianDayUT(dateOfBirth, timeOfBirth, timezone);

    const houseResult = sweph.houses_ex(jd, CALC_FLAGS, latitude, longitude, 'W');
    const ascendantLongitude = houseResult.data.points[0];
    const asc = rashiFor(ascendantLongitude);
    const ascendant: AscendantInfo = { longitude: ascendantLongitude, rashi: asc.rashi, degreeInRashi: asc.degreeInRashi };

    const planets: PlanetPosition[] = [];
    let rahuLongitude = 0;

    for (const graha of GRAHAS) {
      if (graha === 'Ketu') continue;
      const code = PLANET_CODES[graha];
      const result = sweph.calc_ut(jd, code, CALC_FLAGS);
      const longitude = result.data[0];
      const speed = result.data[3];
      if (graha === 'Rahu') rahuLongitude = longitude;
      planets.push(this.toPlanetPosition(graha, longitude, speed, asc.signIndex));
    }

    // Ketu is always exactly opposite Rahu (both are lunar nodes, not physical bodies).
    const ketuLongitude = normalizeDegrees(rahuLongitude + 180);
    planets.push(this.toPlanetPosition('Ketu', ketuLongitude, 0, asc.signIndex));

    const houses = Array.from({ length: 12 }, (_, i) => ({
      house: i + 1,
      rashi: RASHIS[(asc.signIndex + i) % 12],
    }));

    const moon = planets.find((p) => p.graha === 'Moon')!;
    const moonNakshatra = { name: moon.nakshatra, pada: moon.nakshatraPada };

    const dashas = this.computeVimshottariDasha(moon.longitude, dateOfBirth);
    const doshas = this.computeDoshas(planets);
    const yogas = this.computeYogas(planets);

    return { julianDayUT: jd, ascendant, planets, houses, moonNakshatra, dashas, doshas, yogas };
  }

  private toPlanetPosition(graha: Graha, longitude: number, speed: number, ascendantSignIndex: number): PlanetPosition {
    const { rashi, degreeInRashi, signIndex } = rashiFor(longitude);
    const nak = nakshatraFor(longitude);
    const house = ((signIndex - ascendantSignIndex + 12) % 12) + 1;
    // Nodes (Rahu/Ketu) are always treated as retrograde by convention.
    const isRetrograde = graha === 'Rahu' || graha === 'Ketu' ? true : speed < 0;
    return { graha, longitude, rashi, degreeInRashi, nakshatra: nak.name, nakshatraPada: nak.pada, house, isRetrograde };
  }

  private computeVimshottariDasha(moonLongitude: number, dateOfBirth: Date): DashaPeriod[] {
    const norm = normalizeDegrees(moonLongitude);
    const nakshatraIndex = Math.floor(norm / NAKSHATRA_SPAN_DEG);
    const withinNakshatra = norm - nakshatraIndex * NAKSHATRA_SPAN_DEG;
    const elapsedFraction = withinNakshatra / NAKSHATRA_SPAN_DEG;

    const startLordIndex = nakshatraIndex % 9;
    const sequence = [
      ...VIMSHOTTARI_LORD_SEQUENCE.slice(startLordIndex),
      ...VIMSHOTTARI_LORD_SEQUENCE.slice(0, startLordIndex),
    ];

    const dashas: DashaPeriod[] = [];
    let cursor = DateTime.fromJSDate(dateOfBirth, { zone: 'utc' });

    sequence.forEach((lord, i) => {
      const fullYears = VIMSHOTTARI_PERIOD_YEARS[lord];
      // The first (birth) dasha is already partially elapsed.
      const years = i === 0 ? fullYears * (1 - elapsedFraction) : fullYears;
      const start = cursor;
      const end = cursor.plus({ days: years * 365.25 });
      dashas.push({ lord, startDate: start.toISODate()!, endDate: end.toISODate()!, years: Math.round(years * 100) / 100 });
      cursor = end;
    });

    return dashas;
  }

  private computeDoshas(planets: PlanetPosition[]): DoshaResult[] {
    const mars = planets.find((p) => p.graha === 'Mars')!;
    const mangalHouses = [1, 2, 4, 7, 8, 12];
    const mangalDosha = mangalHouses.includes(mars.house);
    const mangal: DoshaResult = {
      name: 'Mangal Dosha',
      present: mangalDosha,
      reason: mangalDosha
        ? `Mars is placed in house ${mars.house} from the Ascendant, one of the Mangal Dosha houses (1, 2, 4, 7, 8, 12).`
        : `Mars is placed in house ${mars.house} from the Ascendant, which is not a Mangal Dosha house.`,
    };

    const rahu = planets.find((p) => p.graha === 'Rahu')!;
    const ketu = planets.find((p) => p.graha === 'Ketu')!;
    const others = planets.filter((p) => p.graha !== 'Rahu' && p.graha !== 'Ketu');
    const isBetween = (lon: number, from: number, to: number) => {
      const span = normalizeDegrees(to - from);
      const rel = normalizeDegrees(lon - from);
      return rel <= span;
    };
    const allOneSide =
      others.every((p) => isBetween(p.longitude, rahu.longitude, ketu.longitude)) ||
      others.every((p) => isBetween(p.longitude, ketu.longitude, rahu.longitude));
    const kaalSarp: DoshaResult = {
      name: 'Kaal Sarp Dosha',
      present: allOneSide,
      reason: allOneSide
        ? 'All seven classical planets fall on one side of the Rahu-Ketu axis.'
        : 'The seven classical planets are distributed on both sides of the Rahu-Ketu axis.',
    };

    const sun = planets.find((p) => p.graha === 'Sun')!;
    const pitraAfflicted = sun.house === rahu.house || sun.house === ketu.house;
    const pitra: DoshaResult = {
      name: 'Pitra Dosha',
      present: pitraAfflicted,
      reason: pitraAfflicted
        ? `Sun shares house ${sun.house} with ${sun.house === rahu.house ? 'Rahu' : 'Ketu'}, a classical Pitra Dosha (ancestral affliction) indicator${sun.house === 9 ? ', particularly significant here as it falls in the 9th house of ancestry' : ''}.`
        : 'Sun is not conjunct Rahu or Ketu, so this classical Pitra Dosha indicator is not present.',
    };

    return [mangal, kaalSarp, pitra];
  }

  /**
   * A core, well-defined subset of classical yogas — not the full catalog
   * (hundreds of named combinations across different schools), which is
   * out of scope here. See ROADMAP.md.
   */
  private computeYogas(planets: PlanetPosition[]): YogaResult[] {
    const yogas: YogaResult[] = [];
    const byGraha = Object.fromEntries(planets.map((p) => [p.graha, p])) as Record<string, PlanetPosition>;

    for (const [graha, config] of Object.entries(MAHAPURUSHA_SIGNS)) {
      const planet = byGraha[graha];
      const { signIndex } = rashiFor(planet.longitude);
      const present = config.signs.includes(signIndex) && KENDRA_HOUSES.includes(planet.house);
      yogas.push({
        name: config.yoga,
        present,
        reason: present
          ? `${graha} is in its own or exaltation sign (${planet.rashi}) while placed in Kendra house ${planet.house} from the Ascendant — the classical condition for ${config.yoga}.`
          : `${graha} does not meet both conditions (own/exaltation sign in a Kendra house) for ${config.yoga}.`,
      });
    }

    const moon = byGraha.Moon;
    const jupiter = byGraha.Jupiter;
    const { signIndex: moonSignIndex } = rashiFor(moon.longitude);
    const { signIndex: jupiterSignIndex } = rashiFor(jupiter.longitude);
    const jupiterHouseFromMoon = ((jupiterSignIndex - moonSignIndex + 12) % 12) + 1;
    const gajakesari = KENDRA_HOUSES.includes(jupiterHouseFromMoon);
    yogas.push({
      name: 'Gajakesari Yoga',
      present: gajakesari,
      reason: gajakesari
        ? `Jupiter is in a Kendra position (house ${jupiterHouseFromMoon}) counted from the Moon, the classical condition for Gajakesari Yoga.`
        : `Jupiter is not in a Kendra position from the Moon (house ${jupiterHouseFromMoon}), so Gajakesari Yoga is not present.`,
    });

    const sun = byGraha.Sun;
    const mercury = byGraha.Mercury;
    const budhaditya = sun.house === mercury.house;
    yogas.push({
      name: 'Budhaditya Yoga',
      present: budhaditya,
      reason: budhaditya
        ? `Sun and Mercury are conjunct in house ${sun.house}, the classical condition for Budhaditya Yoga (intellect and communication).`
        : 'Sun and Mercury are not conjunct, so Budhaditya Yoga is not present.',
    });

    const mars = byGraha.Mars;
    const chandraMangal = moon.house === mars.house;
    yogas.push({
      name: 'Chandra-Mangal Yoga',
      present: chandraMangal,
      reason: chandraMangal
        ? `Moon and Mars are conjunct in house ${moon.house}, the classical condition for Chandra-Mangal Yoga (financial acumen).`
        : 'Moon and Mars are not conjunct, so Chandra-Mangal Yoga is not present.',
    });

    return yogas;
  }
}
