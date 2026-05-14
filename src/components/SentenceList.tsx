import { useApp } from '../context/AppContext';
import SentenceCard from './SentenceCard';

export default function SentenceList() {
  const { state } = useApp();

  if (state.sentences.length === 0) {
    return (
      <div className="text-center text-[#8A8A8E] mt-24 text-base">
        Paste text above and click <strong className="text-[#D1D1D6]">Process text</strong> to get started
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mt-6 space-y-6 pb-16">
      {state.sentences.map(sentence => (
        <SentenceCard key={sentence.id} sentence={sentence} />
      ))}
    </div>
  );
}
