import type { EuropassCvConfig } from './europass/types.js';
import type { ProfessionalCvConfig } from './professional/types.js';

export type CvTemplate = 'europass' | 'professional';

export type SupportedCvConfig = EuropassCvConfig | ProfessionalCvConfig;
