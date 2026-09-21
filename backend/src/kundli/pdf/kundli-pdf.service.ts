import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import type { DashaPeriod, DoshaResult, PlanetPosition } from '../astrology/astrology.types.js';

interface KundliPdfInput {
  profileName: string;
  dateOfBirth: Date;
  timeOfBirth: string;
  placeOfBirth: string;
  ascendantRashi: string;
  planets: PlanetPosition[];
  houses: { house: number; rashi: string }[];
  moonNakshatra: { name: string; pada: number };
  dashas: DashaPeriod[];
  doshas: DoshaResult[];
  generatedAt: Date;
}

@Injectable()
export class KundliPdfService {
  build(input: KundliPdfInput): PDFKit.PDFDocument {
    const doc = new PDFDocument({ margin: 50 });

    doc.fontSize(20).text('Free Kundli Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#666').text(`Generated on ${input.generatedAt.toDateString()}`, { align: 'center' });
    doc.fillColor('#000');
    doc.moveDown(1.5);

    doc.fontSize(14).text('Birth Details');
    doc.fontSize(11);
    doc.text(`Name: ${input.profileName}`);
    doc.text(`Date of Birth: ${input.dateOfBirth.toDateString()}`);
    doc.text(`Time of Birth: ${input.timeOfBirth}`);
    doc.text(`Place of Birth: ${input.placeOfBirth}`);
    doc.text(`Ascendant (Lagna): ${input.ascendantRashi}`);
    doc.text(`Moon Nakshatra: ${input.moonNakshatra.name}, Pada ${input.moonNakshatra.pada}`);
    doc.moveDown(1);

    doc.fontSize(14).text('Planetary Positions');
    doc.fontSize(10);
    input.planets.forEach((p) => {
      doc.text(
        `${p.graha.padEnd(8)}  ${p.rashi.padEnd(12)}  ${p.degreeInRashi.toFixed(2)}°  House ${p.house}  ${p.nakshatra} (Pada ${p.nakshatraPada})${p.isRetrograde ? '  [R]' : ''}`,
      );
    });
    doc.moveDown(1);

    doc.fontSize(14).text('House-wise Sign Placement (Whole Sign)');
    doc.fontSize(10);
    input.houses.forEach((h) => doc.text(`House ${h.house}: ${h.rashi}`));
    doc.moveDown(1);

    doc.fontSize(14).text('Vimshottari Dasha (Mahadasha sequence)');
    doc.fontSize(10);
    input.dashas.forEach((d) => doc.text(`${d.lord.padEnd(8)}  ${d.startDate} to ${d.endDate}  (${d.years} yrs)`));
    doc.moveDown(1);

    doc.fontSize(14).text('Dosha Check');
    doc.fontSize(10);
    input.doshas.forEach((d) => doc.text(`${d.name}: ${d.present ? 'Present' : 'Not present'} — ${d.reason}`));

    doc.moveDown(1.5);
    doc
      .fontSize(8)
      .fillColor('#888')
      .text(
        'Computed using the Swiss Ephemeris (Moshier semi-analytical mode) with Lahiri ayanamsa. Whole-sign house system. Yoga identification is not yet included.',
      );

    doc.end();
    return doc;
  }
}
