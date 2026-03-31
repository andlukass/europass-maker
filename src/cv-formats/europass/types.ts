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
}

export interface EuropassLanguageItem {
  language: string;
  level: string;
  break?: boolean;
}

export interface EuropassCvConfig {
  template?: 'europass';
  cvLanguage?: CvLanguage;
  personal: {
    photoPath?: string;
    name: string;
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
