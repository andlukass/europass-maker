import type { CvLanguage } from '../common.js';

export interface EuropassExperienceItem {
  from?: string;
  to?: string;
  country?: string;
  role: string;
  company?: string;
  bullets?: string[];
}

export interface EuropassEducationItem {
  title: string;
  institution?: string;
  date?: string;
}

export interface EuropassLanguageItem {
  language: string;
  level: string;
  break?: boolean;
}

export interface EuropassCvConfig {
  cvKind: 'europass' | 'europass-2';
  template?: 'europass' | 'europass-2';
  cvLanguage?: CvLanguage;
  personal: {
    photoPath?: string;
    name: string;
    birthDate?: string;
    nationality?: string;
    sex?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
    address?: string;
  };
  sections: {
    presentation?: { text: string };
    objective?: { text: string };
    experience?: EuropassExperienceItem[];
    education?: EuropassEducationItem[];
    languages?: EuropassLanguageItem[];
    skills?: string[];
  };
}
