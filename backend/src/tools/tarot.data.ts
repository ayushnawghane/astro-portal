export interface TarotCardInfo {
  name: string;
  upright: string;
  reversed: string;
}

// Major Arcana only (22 cards) — a common scope for quick-draw tarot tools.
export const MAJOR_ARCANA: TarotCardInfo[] = [
  { name: 'The Fool', upright: 'New beginnings, spontaneity, innocence.', reversed: 'Recklessness, risk-taking, naivety.' },
  { name: 'The Magician', upright: 'Manifestation, resourcefulness, power.', reversed: 'Manipulation, poor planning, untapped talent.' },
  { name: 'The High Priestess', upright: 'Intuition, mystery, inner knowledge.', reversed: 'Secrets withheld, disconnection from intuition.' },
  { name: 'The Empress', upright: 'Abundance, nurturing, fertility.', reversed: 'Dependence, smothering, creative block.' },
  { name: 'The Emperor', upright: 'Authority, structure, control.', reversed: 'Rigidity, domination, lack of discipline.' },
  { name: 'The Hierophant', upright: 'Tradition, conformity, guidance.', reversed: 'Rebellion, unconventionality.' },
  { name: 'The Lovers', upright: 'Love, harmony, meaningful choices.', reversed: 'Disharmony, imbalance, misaligned values.' },
  { name: 'The Chariot', upright: 'Willpower, determination, victory.', reversed: 'Lack of control, opposition, no clear direction.' },
  { name: 'Strength', upright: 'Courage, patience, inner strength.', reversed: 'Self-doubt, weakness, insecurity.' },
  { name: 'The Hermit', upright: 'Soul-searching, introspection, solitude.', reversed: 'Isolation, loneliness, withdrawal.' },
  { name: 'Wheel of Fortune', upright: 'Change, cycles, destiny.', reversed: 'Bad luck, resistance to change.' },
  { name: 'Justice', upright: 'Fairness, truth, cause and effect.', reversed: 'Unfairness, dishonesty, lack of accountability.' },
  { name: 'The Hanged Man', upright: 'Pause, surrender, new perspective.', reversed: 'Delay, resistance, stalling.' },
  { name: 'Death', upright: 'Endings, transformation, transition.', reversed: 'Resistance to change, fear of endings.' },
  { name: 'Temperance', upright: 'Balance, moderation, patience.', reversed: 'Imbalance, excess, lack of harmony.' },
  { name: 'The Devil', upright: 'Bondage, materialism, addiction.', reversed: 'Breaking free, release, reclaiming power.' },
  { name: 'The Tower', upright: 'Sudden upheaval, chaos, revelation.', reversed: 'Avoiding disaster, delayed change.' },
  { name: 'The Star', upright: 'Hope, faith, renewal.', reversed: 'Despair, disconnection, discouragement.' },
  { name: 'The Moon', upright: 'Illusion, fear, the subconscious.', reversed: 'Confusion clearing, releasing fear.' },
  { name: 'The Sun', upright: 'Joy, success, vitality.', reversed: 'Temporary setbacks, lack of clarity.' },
  { name: 'Judgement', upright: 'Reflection, reckoning, awakening.', reversed: 'Self-doubt, ignoring the call.' },
  { name: 'The World', upright: 'Completion, accomplishment, fulfillment.', reversed: 'Incompletion, delay, lack of closure.' },
];
