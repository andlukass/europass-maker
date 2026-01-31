/**
 * CV configuration structure (matches JSON format)
 */
export interface ExperienceItem {
  from?: string;
  to?: string;
  country?: string;
  role: string;
  company?: string;
  bullets?: string[];
}

export interface EducationItem {
  title: string;
  institution?: string;
}

export interface LanguageItem {
  language: string;
  level: string;
}

export interface CvConfig {
  outputPdf?: string;
  logoPath?: string;
  personal: {
    photoPath?: string;
    name: string;
    nationality?: string;
    sex?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  sections: {
    presentation?: { text: string };
    objective?: { text: string };
    experience?: ExperienceItem[];
    education?: EducationItem[];
    languages?: LanguageItem[];
    skills?: string[];
  };
}

export function validateConfig(config: unknown): config is CvConfig {
  if (typeof config !== 'object' || config === null) return false;
  const c = config as Record<string, unknown>;
  if (typeof c.personal !== 'object' || c.personal === null) return false;
  const p = c.personal as Record<string, unknown>;
  return typeof p.name === 'string' && p.name.trim().length > 0;
}
