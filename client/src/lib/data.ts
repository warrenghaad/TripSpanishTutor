
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

export type Scenario = {
  id: string;
  condition: string;
  spanishCondition: string;
  action: string;
  spanishAction: string;
  location: string;
  icon: string;
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
  {
    id: 'ir',
    spanish: 'ir',
    english: 'to go',
    conjugations: {
      present: { yo: 'voy', tu: 'vas', el: 'va' },
      past: { yo: 'fui', tu: 'fuiste', el: 'fue' },
      future: { yo: 'iré', tu: 'irás', el: 'irá' },
    },
  },
  {
    id: 'necesitar',
    spanish: 'necesitar',
    english: 'to need',
    conjugations: {
      present: { yo: 'necesito', tu: 'necesitas', el: 'necesita' },
      past: { yo: 'necesité', tu: 'necesitaste', el: 'necesitó' },
      future: { yo: 'necesitaré', tu: 'necesitarás', el: 'necesitará' },
    },
  },
  {
    id: 'querer',
    spanish: 'querer',
    english: 'to want',
    conjugations: {
      present: { yo: 'quiero', tu: 'quieres', el: 'quiere' },
      past: { yo: 'quise', tu: 'quisiste', el: 'quiso' },
      future: { yo: 'querré', tu: 'querrás', el: 'querrá' },
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

export const conditionalScenarios: Scenario[] = [
  {
    id: 'hungry',
    condition: "If I am hungry...",
    spanishCondition: "Si tengo hambre...",
    action: "I go to a restaurant",
    spanishAction: "Voy a un restaurante",
    location: "El Restaurante",
    icon: "utensils"
  },
  {
    id: 'sick',
    condition: "If I feel sick...",
    spanishCondition: "Si me siento mal...",
    action: "I go to the pharmacy/doctor",
    spanishAction: "Voy a la farmacia o al doctor",
    location: "La Farmacia",
    icon: "activity"
  },
  {
    id: 'lost',
    condition: "If I am lost...",
    spanishCondition: "Si estoy perdido...",
    action: "I ask for help",
    spanishAction: "Pido ayuda",
    location: "La Calle / El Policía",
    icon: "map-pin"
  },
  {
    id: 'money',
    condition: "If I need money...",
    spanishCondition: "Si necesito dinero...",
    action: "I go to the bank/ATM",
    spanishAction: "Voy al banco o al cajero",
    location: "El Banco / El Cajero",
    icon: "dollar-sign"
  },
    {
    id: 'shopping',
    condition: "If I want to buy clothes...",
    spanishCondition: "Si quiero comprar ropa...",
    action: "I go to the market/store",
    spanishAction: "Voy al mercado o a la tienda",
    location: "El Mercado",
    icon: "shopping-bag"
  }
];
