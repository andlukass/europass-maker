export type { CvLanguage } from './cv-formats/common.js';
import { detectCvTemplate } from './cv-formats/detect.js';
export type {
  EuropassCvConfig as CvConfig,
  EuropassExperienceItem as ExperienceItem,
  EuropassEducationItem as EducationItem,
  EuropassLanguageItem as LanguageItem,
} from './cv-formats/europass/types.js';

export function validateConfig(config: unknown): boolean {
  try {
    return detectCvTemplate(config) === 'europass';
  } catch {
    return false;
  }
}
