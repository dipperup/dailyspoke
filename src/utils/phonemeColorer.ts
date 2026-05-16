export interface PhonemeToken {
  char: string;
  type: 'vowel' | 'consonant' | 'diphthong' | 'stress' | 'unknown';
}

const VOWELS = new Set([
  'ɑ', 'æ', 'ʌ', 'ɔ', 'ɛ', 'ɝ', 'ɚ', 'ɪ', 'i', 'ʊ', 'u', 'ə',
  'a', 'e', 'o', 'ɜ', 'ɞ', 'ɘ', 'ɵ', 'ʉ', 'ɨ', 'ɤ', 'ø', 'y',
  'œ', 'ɶ', 'ʏ', 'ɯ', 'ɐ', 'ɒ',
]);

const DIPHTHONGS = new Set([
  'aʊ', 'aɪ', 'eɪ', 'oʊ', 'ɔɪ',
]);

const AFFRICATES = new Set([
  'tʃ', 'dʒ',
]);

const STRESS_MARKS = new Set(['ˈ', 'ˌ']);

export function tokenizeIPA(ipa: string): PhonemeToken[] {
  const tokens: PhonemeToken[] = [];
  let i = 0;

  while (i < ipa.length) {
    // Stress mark
    if (STRESS_MARKS.has(ipa[i])) {
      tokens.push({ char: ipa[i], type: 'stress' });
      i++;
      continue;
    }

    // Try two-character match (diphthong or affricate)
    if (i + 1 < ipa.length) {
      const two = ipa.substring(i, i + 2);
      if (DIPHTHONGS.has(two)) {
        tokens.push({ char: two, type: 'diphthong' });
        i += 2;
        continue;
      }
      if (AFFRICATES.has(two)) {
        tokens.push({ char: two, type: 'consonant' });
        i += 2;
        continue;
      }
    }

    // Single character
    const ch = ipa[i];
    if (VOWELS.has(ch)) {
      tokens.push({ char: ch, type: 'vowel' });
    } else {
      tokens.push({ char: ch, type: 'consonant' });
    }
    i++;
  }

  return tokens;
}

export const PHONEME_COLORS: Record<PhonemeToken['type'], string> = {
  vowel: '#60A5FA',       // soft blue
  consonant: '#9CA3AF',   // gray
  diphthong: '#30D158',   // green
  stress: '#FF453A',      // red highlight for stress
  unknown: '#8A8A8E',
};
