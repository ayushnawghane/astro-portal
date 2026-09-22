import { Injectable } from '@nestjs/common';
import { lifePathNumber, destinyNumber, soulUrgeNumber, NUMBER_MEANINGS } from './numerology.util.js';
import { sunSignFor, zodiacCompatibility, type WesternSign } from './zodiac.util.js';
import { MAJOR_ARCANA } from './tarot.data.js';

@Injectable()
export class ToolsService {
  numerology(fullName: string, dateOfBirthStr: string) {
    const dateOfBirth = new Date(dateOfBirthStr);
    const lifePath = lifePathNumber(dateOfBirth);
    const destiny = destinyNumber(fullName);
    const soulUrge = soulUrgeNumber(fullName);
    return {
      lifePathNumber: lifePath,
      lifePathMeaning: NUMBER_MEANINGS[lifePath],
      destinyNumber: destiny,
      destinyMeaning: NUMBER_MEANINGS[destiny],
      soulUrgeNumber: soulUrge,
      soulUrgeMeaning: NUMBER_MEANINGS[soulUrge],
    };
  }

  zodiacSign(dateOfBirthStr: string) {
    const info = sunSignFor(new Date(dateOfBirthStr));
    return info;
  }

  zodiacCompatibility(signA: string, signB: string) {
    return zodiacCompatibility(signA as WesternSign, signB as WesternSign);
  }

  drawTarot(spread: 'single' | 'three') {
    const count = spread === 'three' ? 3 : 1;
    const positions = spread === 'three' ? ['Past', 'Present', 'Future'] : ['Your Card'];
    const deck = [...MAJOR_ARCANA];
    const drawn: { position: string; name: string; reversed: boolean; meaning: string }[] = [];

    for (let i = 0; i < count; i++) {
      const index = Math.floor(Math.random() * deck.length);
      const [card] = deck.splice(index, 1);
      const reversed = Math.random() < 0.5;
      drawn.push({
        position: positions[i],
        name: card.name,
        reversed,
        meaning: reversed ? card.reversed : card.upright,
      });
    }

    return { cards: drawn };
  }
}
