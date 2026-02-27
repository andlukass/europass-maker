import type { SupportedCvConfig } from '../cv-formats/types.js';
import { isEuropassCvConfig } from '../cv-formats/europass/validate.js';
import { isProfessionalCvConfig } from '../cv-formats/professional/validate.js';
import { generateEuropassHtml } from '../cv-formats/europass/render.js';
import { generateProfessionalHtml } from '../cv-formats/professional/render.js';

export function generateHtml(config: SupportedCvConfig, rasc?: boolean): string {
  if (isEuropassCvConfig(config)) {
    return generateEuropassHtml(config, rasc);
  }

  if (isProfessionalCvConfig(config)) {
    return generateProfessionalHtml(config);
  }

  throw new Error('Unsupported CV config format');
}
