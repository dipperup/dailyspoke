import type { WordToken, Sentence, Emotion } from '../types';

export function splitSentences(text: string): string[] {
  // Split after .!? that may be followed by closing quotes/parens, then whitespace
  return text
    .split(/(?<=[.!?]["')\]]*)\s+(?=["'(\[]*[A-Z])|\n\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

export function autoDetectEmotion(text: string): Emotion {
  const trimmed = text.trim();
  if (trimmed.endsWith('!') || trimmed.endsWith('!!') || trimmed.endsWith('!?')) {
    return 'excited';
  }
  if (trimmed.endsWith('?')) {
    return 'question';
  }
  if (trimmed.endsWith('...')) {
    return 'sad';
  }
  const upperCount = (trimmed.match(/[A-Z]{2,}/g) || []).length;
  if (upperCount >= 2) {
    return 'angry';
  }
  return 'neutral';
}

// Attach orphaned punctuation (quotes, parens, etc.) to adjacent word tokens
function mergeOrphanPunctuation(raw: { text: string; idx: number; end: number }[]): typeof raw {
  const result: typeof raw = [];
  let i = 0;
  while (i < raw.length) {
    const t = raw[i];
    const isPunctOnly = !/[a-zA-Z]/.test(t.text);
    if (!isPunctOnly) {
      result.push(t);
      i++;
      continue;
    }
    // Try to merge with previous word (closing punct: " ) ] etc.)
    if (result.length > 0) {
      const prev = result[result.length - 1];
      result[result.length - 1] = {
        text: prev.text + t.text,
        idx: prev.idx,
        end: t.end,
      };
      i++;
      continue;
    }
    // Try to merge with next word (opening punct: " ( [ etc.)
    if (i + 1 < raw.length) {
      const next = raw[i + 1];
      result.push({ text: t.text + next.text, idx: t.idx, end: next.end });
      i += 2;
      continue;
    }
    // Standalone — keep it
    result.push(t);
    i++;
  }
  return result;
}

function tokenizeSentence(sentence: string): WordToken[] {
  const rawTokens: { text: string; idx: number; end: number }[] = [];
  const wordRegex = /\S+/g;
  let match: RegExpExecArray | null;
  while ((match = wordRegex.exec(sentence)) !== null) {
    rawTokens.push({ text: match[0], idx: match.index, end: match.index + match[0].length });
  }
  const merged = mergeOrphanPunctuation(rawTokens);
  return merged.map(t => {
    const cleaned = t.text.toLowerCase().replace(/^[^a-zA-Z']+|[^a-zA-Z']+$/g, '');
    return { text: t.text, cleaned, charStart: t.idx, charEnd: t.end, ipa: null };
  });
}

export function parseSentences(text: string): Sentence[] {
  const rawSentences = splitSentences(text);
  return rawSentences.map((original, id) => ({
    id,
    original,
    words: tokenizeSentence(original),
    ipaLoading: false,
    emotion: autoDetectEmotion(original),
    translation: null,
    translating: false,
  }));
}

export function collectWords(sentences: Sentence[]): string[] {
  const wordSet = new Set<string>();
  for (const s of sentences) {
    for (const w of s.words) {
      if (w.cleaned) wordSet.add(w.cleaned);
    }
  }
  return [...wordSet];
}
