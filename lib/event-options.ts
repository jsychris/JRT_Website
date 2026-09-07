export type EventQuestion = {
  id: string;
  label: string;
  type: 'choice' | 'text';
  choices: string[];
  required: boolean;
  per_guest: boolean;
};
export type BookingAnswers = {
  member: Record<string, string>;
  guests: { name: string; answers: Record<string, string> }[];
};
export function readQuestions(value: string | undefined): EventQuestion[] {
  return value ? JSON.parse(value) : [];
}
export function normaliseQuestions(value: unknown): EventQuestion[] {
  if (!Array.isArray(value) || value.length > 10) throw new Error('Add up to 10 questions.');
  const ids = new Set<string>();
  return value.map(q => {
    if (!q || typeof q !== 'object') throw new Error('Check your event questions.');
    const id = String(q.id || '');
    const label = String(q.label || '').trim();
    if (!/^[a-zA-Z0-9_-]{1,80}$/.test(id) || ids.has(id)) throw new Error('Question identifiers must be unique.');
    ids.add(id);
    if (!label || label.length > 160) throw new Error('Give each question a label of up to 160 characters.');
    if (!['choice', 'text'].includes(q.type)) throw new Error('Choose a valid question type.');
    const choices: string[] = q.type === 'choice' && Array.isArray(q.choices) ? q.choices.map((s: unknown) => String(s).trim()).filter(Boolean) : [];
    if (q.type === 'choice' && (choices.length < 2 || choices.length > 16 || new Set(choices).size !== choices.length || choices.some(s => s.length > 100))) throw new Error(`“${label}” needs 2–16 different choices, each under 101 characters.`);
    return {id, label, type: q.type, choices, required: q.required === true, per_guest: q.per_guest === true};
  });
}
export function normaliseAnswers(questions: EventQuestion[], value: unknown, count: number, response: string): BookingAnswers {
  if (response === 'declined') return {member: {}, guests: []};
  const v = value && typeof value === 'object' ? value as any : {};
  const answerSet = (raw: any, qs: EventQuestion[], who: string) => {
    const result: Record<string, string> = {};
    for (const q of qs) {
      const a = typeof raw?.[q.id] === 'string' ? raw[q.id].trim() : '';
      if (a.length > 300) throw new Error(`${who}: keep “${q.label}” under 301 characters.`);
      if (q.required && response === 'going' && !a) throw new Error(`${who}: please answer “${q.label}”.`);
      if (a && q.type === 'choice' && !q.choices.includes(a)) throw new Error(`${who}: choose a current option for “${q.label}”.`);
      if (a) result[q.id] = a;
    }
    return result;
  };
  return {
    member: answerSet(v.member, questions, 'You'),
    guests: Array.from({length: count}, (_, i) => {
      const guest = Array.isArray(v.guests) ? v.guests[i] : null;
      const name = typeof guest?.name === 'string' ? guest.name.trim() : '';
      if (name.length > 100) throw new Error('Guest names must be under 101 characters.');
      return {name, answers: answerSet(guest?.answers, questions.filter(q => q.per_guest), name || `Guest ${i + 1}`)};
    }),
  };
}
export function formatCost(pence: number) { return pence ? new Intl.NumberFormat('en-GB', {style: 'currency', currency: 'GBP'}).format(pence / 100) : 'Free'; }
