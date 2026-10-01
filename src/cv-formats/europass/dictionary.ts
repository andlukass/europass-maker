import type { CvLanguage } from '../common.js';

export interface EuropassDictionary {
  draft: string;
  birthDate: string;
  nationality: string;
  sex: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  presentation: string;
  objective: string;
  experience: string;
  education: string;
  languages: string;
  skills: string;
}

const pt: EuropassDictionary = {
  draft: 'RASCUNHO',
  birthDate: 'Nascimento',
  nationality: 'Nacionalidade',
  sex: 'Sexo',
  email: 'Email',
  phone: 'Telemóvel',
  whatsapp: 'WhatsApp',
  address: 'Morada',
  presentation: 'Apresentação',
  objective: 'Objetivo Profissional',
  experience: 'Experiência Profissional',
  education: 'Educação e Formação',
  languages: 'Competências Linguísticas',
  skills: 'Habilidades',
};

const en: EuropassDictionary = {
  draft: 'DRAFT',
  birthDate: 'Date of birth',
  nationality: 'Nationality',
  sex: 'Gender',
  email: 'Email',
  phone: 'Phone',
  whatsapp: 'WhatsApp',
  address: 'Address',
  presentation: 'Presentation',
  objective: 'Professional Objective',
  experience: 'Professional Experience',
  education: 'Education and Training',
  languages: 'Linguistic Skills',
  skills: 'Skills',
};

const es: EuropassDictionary = {
  draft: 'RASCUNHO',
  birthDate: 'Fecha de nacimiento',
  nationality: 'Nacionalidad',
  sex: 'Sexo',
  email: 'Correo electrónico',
  phone: 'Teléfono',
  whatsapp: 'WhatsApp',
  address: 'Dirección',
  presentation: 'Presentación',
  objective: 'Objetivo profesional',
  experience: 'Experiencia profesional',
  education: 'Educación y formación',
  languages: 'Competencias lingüísticas',
  skills: 'Competencias',
};

export function getEuropassDictionary(lang: CvLanguage = 'PT'): EuropassDictionary {
  return lang === 'EN' ? en : lang === 'ES' ? es : pt;
}
