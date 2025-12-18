export { es, type TranslationKeys } from './es';
export { en } from './en';

export type Language = 'es' | 'en';

export const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'es', name: 'Español', flag: '🇨🇴' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
];
