import type { SupportedCvConfig } from '../cv-formats/types.js';
import { detectCvTemplate } from '../cv-formats/detect.js';
import type { EuropassCvConfig } from '../cv-formats/europass/types.js';
import type { ProfessionalCvConfig } from '../cv-formats/professional/types.js';
import { generateEuropassHtml } from '../cv-formats/europass/render.js';
import { generateProfessionalHtml } from '../cv-formats/professional/render.js';

export function generateHtml(config: SupportedCvConfig, rasc?: boolean): string {
  const template = detectCvTemplate(config);

  if (template === 'europass') {
    return generateEuropassHtml(config as EuropassCvConfig, rasc);
  }

  if (template === 'professional') {
    return generateProfessionalHtml(config as ProfessionalCvConfig);
  }

  throw new Error('Unsupported CV config format');
}
