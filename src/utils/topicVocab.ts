import type { TopicVocab, HistoryEntry } from '../types';

export const TOPIC_VOCAB: TopicVocab[] = [
  {
    topic: 'People & Relationships',
    keywords: ['person', 'friend', 'family', 'neighbour', 'colleague', 'mentor', 'relative', 'acquaintance', 'companion', 'sibling', 'grandparent', 'classmate'],
    phrases: ['charismatic', 'down-to-earth', 'have a knack for', 'look up to', 'leave a lasting impression', 'hit it off', 'a shoulder to cry on', 'thick as thieves', 'grow apart', 'kindred spirit'],
  },
  {
    topic: 'Places & Travel',
    keywords: ['city', 'country', 'trip', 'journey', 'destination', 'landscape', 'scenery', 'landmark', 'countryside', 'metropolis', 'getaway', 'wanderlust'],
    phrases: ['off the beaten track', 'breathtaking view', 'a hidden gem', 'bucket list', 'vibrant atmosphere', 'hustle and bustle', 'feast for the eyes', 'home away from home', 'travel broadens the mind', 'step back in time'],
  },
  {
    topic: 'Events & Experiences',
    keywords: ['event', 'celebration', 'festival', 'wedding', 'birthday', 'graduation', 'ceremony', 'occasion', 'milestone', 'gathering', 'reunion', 'achievement', 'challenge'],
    phrases: ['once in a lifetime', 'etched in my memory', 'a turning point', 'mixed feelings', 'rose to the challenge', 'exceeded my expectations', 'a rude awakening', 'count my blessings', 'made my day', 'the best is yet to come'],
  },
  {
    topic: 'Objects & Possessions',
    keywords: ['gift', 'phone', 'book', 'photo', 'gadget', 'heirloom', 'souvenir', 'device', 'tool', 'accessory', 'keepsake', 'memento'],
    phrases: ['sentimental value', 'comes in handy', 'state of the art', 'an arm and a leg', 'built to last', 'a game changer', 'worth its weight in gold', 'run of the mill', 'a thing of the past', 'cutting edge'],
  },
  {
    topic: 'Habits & Routines',
    keywords: ['routine', 'habit', 'hobby', 'schedule', 'ritual', 'pastime', 'discipline', 'lifestyle', 'regimen', 'daily', 'weekly', 'morning', 'exercise', 'meditation'],
    phrases: ['second nature', 'force of habit', 'stick to a routine', 'get into the swing of things', 'old habits die hard', 'creature of habit', 'break the cycle', 'tried and tested', 'make a habit of', 'start from scratch'],
  },
  {
    topic: 'Education & Learning',
    keywords: ['school', 'university', 'course', 'teacher', 'subject', 'exam', 'degree', 'study', 'learn', 'skill', 'knowledge', 'education', 'training'],
    phrases: ['thirst for knowledge', 'steep learning curve', 'trial and error', 'broaden my horizons', 'food for thought', 'a quick learner', 'hit the books', 'learn the ropes', 'passed with flying colours', 'think outside the box'],
  },
  {
    topic: 'Work & Career',
    keywords: ['job', 'career', 'boss', 'colleague', 'deadline', 'promotion', 'interview', 'salary', 'profession', 'industry', 'startup', 'freelance', 'meeting'],
    phrases: ['climb the ladder', 'burn the midnight oil', 'a steep learning curve', 'go the extra mile', 'call the shots', 'land a job', 'foot in the door', 'nine-to-five grind', 'work-life balance', 'a tough act to follow'],
  },
  {
    topic: 'Technology & Media',
    keywords: ['app', 'website', 'social media', 'internet', 'smartphone', 'AI', 'digital', 'online', 'screen', 'device', 'platform', 'content', 'video'],
    phrases: ['keep me posted', 'at the touch of a button', 'a blessing and a curse', 'stay connected', 'doom scrolling', 'digital detox', 'lost in the algorithm', 'screen fatigue', 'virtual experience', 'go viral'],
  },
  {
    topic: 'Environment & Nature',
    keywords: ['climate', 'pollution', 'recycle', 'nature', 'weather', 'season', 'ocean', 'forest', 'animal', 'planet', 'green', 'eco', 'sustainable'],
    phrases: ['a drop in the ocean', 'go green', 'carbon footprint', 'at one with nature', 'the tip of the iceberg', 'clear the air', 'make a difference', 'lose sleep over', 'out of the woods', 'climate crisis'],
  },
  {
    topic: 'Health & Wellbeing',
    keywords: ['health', 'diet', 'exercise', 'stress', 'sleep', 'fitness', 'mental', 'doctor', 'hospital', 'food', 'nutrition', 'yoga', 'workout'],
    phrases: ['in good shape', 'peace of mind', 'burn the candle at both ends', 'you are what you eat', 'recharge my batteries', 'run down', 'bounce back', 'fit as a fiddle', 'take its toll', 'a wake-up call'],
  },
];

// Match input text against topic keywords to find the most relevant topic
export function detectTopic(text: string): TopicVocab | null {
  const lower = text.toLowerCase();
  let best: TopicVocab | null = null;
  let bestScore = 0;

  for (const topic of TOPIC_VOCAB) {
    let score = 0;
    for (const kw of topic.keywords) {
      if (lower.includes(kw)) score += 1;
    }
    for (const phrase of topic.phrases) {
      if (lower.includes(phrase)) score += 2;
    }
    if (score > bestScore) {
      bestScore = score;
      best = topic;
    }
  }

  return bestScore >= 2 ? best : null;
}

// Get related topics as suggestions
export function getRelatedTopics(topic: TopicVocab, count = 2): TopicVocab[] {
  const others = TOPIC_VOCAB.filter(t => t.topic !== topic.topic);
  let best: { topic: TopicVocab; score: number }[] = [];

  for (const other of others) {
    const sharedKeywords = other.keywords.filter(k => topic.keywords.includes(k));
    const sharedPhrases = other.phrases.filter(p => topic.phrases.includes(p));
    const score = sharedKeywords.length + sharedPhrases.length * 2;
    best.push({ topic: other, score });
  }

  return best
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(e => e.topic);
}
