import type { WordToken, PlaybackState } from '../types';
import WordSpan from './WordSpan';

interface Props {
  words: WordToken[];
  playback: PlaybackState;
  onReadFrom: (charStart: number) => void;
  onAddVocab: (word: WordToken) => void;
}

export default function SentenceText({ words, playback, onReadFrom, onAddVocab }: Props) {
  return (
    <div className="flex flex-wrap gap-x-1 gap-y-0.5 items-baseline">
      {words.map((word, i) => {
        const isActive =
          playback.currentCharIndex !== null &&
          word.charStart <= playback.currentCharIndex &&
          word.charEnd > playback.currentCharIndex;

        return (
          <WordSpan
            key={`${word.charStart}-${i}`}
            word={word}
            isActive={isActive}
            onReadFrom={() => onReadFrom(word.charStart)}
            onAddVocab={() => onAddVocab(word)}
          />
        );
      })}
    </div>
  );
}
