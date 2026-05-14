const ARPABET_TO_IPA: Record<string, string> = {
  AA: 'ɑ', AE: 'æ', AH: 'ʌ', AO: 'ɔ', AW: 'aʊ', AY: 'aɪ',
  B: 'b', CH: 'tʃ', D: 'd', DH: 'ð',
  EH: 'ɛ', ER: 'ɝ', EY: 'eɪ',
  F: 'f', G: 'ɡ', HH: 'h',
  IH: 'ɪ', IY: 'i',
  JH: 'dʒ', K: 'k', L: 'l', M: 'm', N: 'n', NG: 'ŋ',
  OW: 'oʊ', OY: 'ɔɪ',
  P: 'p', R: 'ɹ', S: 's', SH: 'ʃ', T: 't', TH: 'θ',
  UH: 'ʊ', UW: 'u',
  V: 'v', W: 'w', Y: 'j', Z: 'z', ZH: 'ʒ',
};

export function arpabetToIPA(arpabet: string): string {
  return arpabet
    .split(/\s+/)
    .map(phoneme => {
      const match = phoneme.match(/^([A-Z]+)([012])$/);
      if (match) {
        const base = ARPABET_TO_IPA[match[1]] ?? match[1];
        if (match[2] === '1') return 'ˈ' + base;
        if (match[2] === '2') return 'ˌ' + base;
        return base;
      }
      return ARPABET_TO_IPA[phoneme] ?? phoneme;
    })
    .join('');
}
