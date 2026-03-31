import type { CvLanguage } from '../common.js';

export interface EuropassDictionary {
  draft: string;
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

export function getEuropassDictionary(lang: CvLanguage = 'PT'): EuropassDictionary {
  return lang === 'EN' ? en : pt;
}
