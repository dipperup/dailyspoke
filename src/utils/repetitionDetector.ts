import type { WordFrequency } from '../types';

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for',
  'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
  'before', 'after', 'above', 'below', 'between', 'and', 'but', 'or',
  'nor', 'not', 'so', 'yet', 'both', 'either', 'neither', 'each', 'every',
  'all', 'any', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
  'only', 'own', 'same', 'than', 'too', 'very', 'just', 'because',
  'about', 'up', 'out', 'if', 'then', 'now', 'here', 'there', 'when',
  'where', 'why', 'how', 'which', 'who', 'whom', 'this', 'that', 'these',
  'those', 'it', 'its', 'he', 'she', 'they', 'them', 'we', 'us', 'me',
  'him', 'her', 'his', 'my', 'your', 'our', 'their', 'mine', 'yours',
  'also', 'what', 'get', 'go', 'make', 'know', 'take', 'see', 'come',
  'think', 'look', 'want', 'give', 'use', 'find', 'tell', 'ask', 'work',
  'seem', 'feel', 'try', 'leave', 'call', 'keep', 'let', 'begin', 'start',
  'need', 'like', 'really', 'still', 'back', 'even', 'much', 'well',
]);

// Overused academic hedging that IELTS examiners note
const OVERUSED_MARKERS = new Set([
  'very', 'really', 'quite', 'good', 'bad', 'nice', 'big', 'small',
  'beautiful', 'important', 'interesting', 'thing', 'stuff', 'people',
  'lot', 'always', 'never', 'often', 'sometimes',
]);

export function analyzeRepetition(texts: string[]): WordFrequency[] {
  const freq = new Map<string, number>();
  let totalWords = 0;

  for (const text of texts) {
    const words = text.toLowerCase().match(/[a-z]+/g) ?? [];
    for (const w of words) {
      if (w.length <= 2 || STOP_WORDS.has(w)) continue;
      freq.set(w, (freq.get(w) ?? 0) + 1);
      totalWords++;
    }
  }

  const results: WordFrequency[] = [];
  for (const [word, count] of freq) {
    if (count < 2) continue;
    const level: WordFrequency['level'] =
      OVERUSED_MARKERS.has(word) && count >= 3 ? 'overused' :
      count >= 8 ? 'overused' :
      count >= 4 ? 'warning' :
      'normal';
    results.push({ word, count, level });
  }

  results.sort((a, b) => b.count - a.count);
  return results.slice(0, 30);
}

export function lexicalVarietyScore(texts: string[]): number {
  const allWords: string[] = [];
  const unique = new Set<string>();

  for (const text of texts) {
    const words = text.toLowerCase().match(/[a-z]+/g) ?? [];
    for (const w of words) {
      if (w.length <= 2 || STOP_WORDS.has(w)) continue;
      allWords.push(w);
      unique.add(w);
    }
  }

  if (allWords.length < 20) return 0;
  return Math.round((unique.size / allWords.length) * 100);
}
