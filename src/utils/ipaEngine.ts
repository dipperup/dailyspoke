import { arpabetToIPA } from './arpabetToIPA';

let dictionaryPromise: Promise<Record<string, string>> | null = null;

function loadDictionary(): Promise<Record<string, string>> {
  if (!dictionaryPromise) {
    dictionaryPromise = import('cmu-pronouncing-dictionary').then(m => {
      return (m as unknown as { dictionary: Record<string, string> }).dictionary;
    });
  }
  return dictionaryPromise;
}

export async function lookupBatch(words: string[]): Promise<Record<string, string>> {
  const dict = await loadDictionary();
  const result: Record<string, string> = {};
  const unique = [...new Set(words.map(w => w.toLowerCase()))];
  for (const word of unique) {
    if (!word) continue;
    const arpabet = dict[word];
    if (arpabet) {
      result[word] = arpabetToIPA(arpabet);
    }
  }
  return result;
}
