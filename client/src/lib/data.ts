
export type VocabularyItem = {
  id: string;
  spanish: string;
  english: string;
  category: string;
  icon?: string;
};

export type Verb = {
  id: string;
  spanish: string;
  english: string;
  conjugations: {
    present: { yo: string; tu: string; el: string };
    past: { yo: string; tu: string; el: string };
    future: { yo: string; tu: string; el: string };
  };
};

export const bodyParts: VocabularyItem[] = [
  { id: 'cabeza', spanish: 'la cabeza', english: 'head', category: 'body', icon: 'brain' },
  { id: 'brazo', spanish: 'el brazo', english: 'arm', category: 'body', icon: 'hand' },
  { id: 'pierna', spanish: 'la pierna', english: 'leg', category: 'body', icon: 'footprints' },
  { id: 'estomago', spanish: 'el estómago', english: 'stomach', category: 'body', icon: 'activity' },
  { id: 'espalda', spanish: 'la espalda', english: 'back', category: 'body', icon: 'user' },
  { id: 'garganta', spanish: 'la garganta', english: 'throat', category: 'body', icon: 'mic' },
];

export const commonVerbs: Verb[] = [
  {
    id: 'doler',
    spanish: 'doler',
    english: 'to hurt',
    conjugations: {
      present: { yo: 'me duele', tu: 'te duele', el: 'le duele' },
      past: { yo: 'me dolió', tu: 'te dolió', el: 'le dolió' },
      future: { yo: 'me dolerá', tu: 'te dolerá', el: 'le dolerá' },
    },
  },
  {
    id: 'lavar',
    spanish: 'lavar',
    english: 'to wash',
    conjugations: {
      present: { yo: 'lavo', tu: 'lavas', el: 'lava' },
      past: { yo: 'lavé', tu: 'lavaste', el: 'lavó' },
      future: { yo: 'lavaré', tu: 'lavarás', el: 'lavará' },
    },
  },
  {
    id: 'mover',
    spanish: 'mover',
    english: 'to move',
    conjugations: {
      present: { yo: 'muevo', tu: 'mueves', el: 'mueve' },
      past: { yo: 'moví', tu: 'moviste', el: 'movió' },
      future: { yo: 'moveré', tu: 'moverás', el: 'moverá' },
    },
  },
];

export const situations = [
  {
    id: 'taxi',
    title: 'Getting a Taxi',
    description: 'Negotiating price, giving directions, and tipping.',
    icon: 'car',
    phrases: [
      { speaker: 'me', spanish: '¿Cuánto cuesta ir al Hotel Rosita?', english: 'How much to go to Hotel Rosita?' },
      { speaker: 'them', spanish: 'Son cien pesos.', english: 'It is 100 pesos.' },
      { speaker: 'me', spanish: 'Aquí tiene, quédese con el cambio.', english: 'Here you go, keep the change.' },
    ]
  },
  {
    id: 'hotel',
    title: 'Hotel Check-in',
    description: 'Checking in, asking for a corner room, luggage.',
    icon: 'building',
    phrases: [
      { speaker: 'me', spanish: 'Tengo una reservación a nombre de...', english: 'I have a reservation under...' },
      { speaker: 'me', spanish: '¿Podría darme una habitación en la esquina? Soy músico y necesito silencio.', english: 'Could I have a corner room? I am a musician and need quiet.' },
      { speaker: 'me', spanish: 'Puedo llevar mis propias maletas, gracias.', english: 'I can take my own bags, thanks.' },
    ]
  },
  {
    id: 'restaurant',
    title: 'Ordering Food',
    description: 'Ordering, asking for the bill, small talk.',
    icon: 'utensils',
    phrases: [
      { speaker: 'me', spanish: 'La cuenta, por favor.', english: 'The check, please.' },
      { speaker: 'me', spanish: '¿Qué me recomienda?', english: 'What do you recommend?' },
      { speaker: 'them', spanish: '¿Todo bien?', english: 'Is everything okay?' },
    ]
  }
];
