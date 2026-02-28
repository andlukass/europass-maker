import type { CvLanguage } from '../common.js';

export interface ProfessionalContactInfo {
  phone?: string | null;
  email?: string | null;
  birthDate?: string | null;
  linkedin?: string | null;
}

export interface ProfessionalHeader {
  name: string;
  headline?: string | null;
  location?: string | null;
  photoPath?: string | null;
  contacts?: ProfessionalContactInfo;
}

export interface ProfessionalSummary {
  text: string;
}

export interface ProfessionalSkillGroup {
  category: string;
  items: string[];
}

export interface ProfessionalPeriod {
  start: string;
  end?: string | null;
  isCurrent?: boolean | null;
}

export interface ProfessionalEducationItem {
  institution: string;
  location?: string | null;
  degree: string;
  period?: {
    start?: string | null;
    end?: string | null;
  } | null;
  bullets?: string[];
}

export interface ProfessionalExperienceItem {
  company: string;
  location?: string | null;
  role: string;
  period?: ProfessionalPeriod | null;
  bullets?: string[];
}

export interface ProfessionalProjectItem {
  company: string;
  location?: string | null;
  role: string;
  period?: ProfessionalPeriod | null;
  bullets?: string[];
}

export interface ProfessionalSections {
  technicalSkills?: ProfessionalSkillGroup[];
  education?: ProfessionalEducationItem[];
  experience?: ProfessionalExperienceItem[];
  projects?: ProfessionalProjectItem[];
}

export interface ProfessionalCvConfig {
  template?: 'professional';
  cvLanguage?: CvLanguage;
  header: ProfessionalHeader;
  summary: ProfessionalSummary;
  sections: ProfessionalSections;
}
