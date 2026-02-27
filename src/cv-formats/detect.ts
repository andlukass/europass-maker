import type { CvTemplate, SupportedCvConfig } from './types.js';
import { isEuropassCvConfig } from './europass/validate.js';
import { isProfessionalCvConfig } from './professional/validate.js';

export function detectCvTemplate(config: unknown): CvTemplate {
  if (isEuropassCvConfig(config)) return 'europass';
  if (isProfessionalCvConfig(config)) return 'professional';

  throw new Error(
    'Invalid config. Expected either Europass format (personal.name) or Professional format (header.name + summary.text).'
  );
}

export function parseCvConfig(config: unknown): SupportedCvConfig {
  if (isEuropassCvConfig(config)) return config;
  if (isProfessionalCvConfig(config)) return config;

  throw new Error(
    'Invalid config. Expected either Europass format (personal.name) or Professional format (header.name + summary.text).'
  );
}
