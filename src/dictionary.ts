import type { CvLanguage } from './model.js';

export interface Dictionary {
  draft: string;
  nationality: string;
  sex: string;
  email: string;
  phone: string;
  address: string;
  presentation: string;
  objective: string;
  experience: string;
  education: string;
  languages: string;
  skills: string;
}

const pt: Dictionary = {
  draft: 'RASCUNHO',
  nationality: 'Nacionalidade',
  sex: 'Sexo',
  email: 'Email',
  phone: 'Telemóvel',
  address: 'Morada',
  presentation: 'Apresentação',
  objective: 'Objetivo Profissional',
  experience: 'Experiência Profissional',
  education: 'Educação e Formação',
  languages: 'Competências Linguísticas',
  skills: 'Habilidades',
};

const en: Dictionary = {
  draft: 'DRAFT',
  nationality: 'Nationality',
  sex: 'Gender',
  email: 'Email',
  phone: 'Phone',
  address: 'Address',
  presentation: 'Presentation',
  objective: 'Professional Objective',
  experience: 'Professional Experience',
  education: 'Education and Training',
  languages: 'Linguistic Skills',
  skills: 'Skills',
};

export function getDictionary(lang: CvLanguage = 'PT'): Dictionary {
  return lang === 'EN' ? en : pt;
}
