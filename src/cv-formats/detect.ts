import type { EuropassCvConfig } from './europass/types.js';
import type { ProfessionalCvConfig } from './professional/types.js';
import type { CvTemplate, SupportedCvConfig } from './types.js';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function detectCvTemplate(config: unknown): CvTemplate {
  if (!isObject(config)) throw new Error('Invalid config. Expected an object.');
  return config.cvKind === 'professional' ? 'professional' : 'europass';
}

export function parseCvConfig(config: unknown): SupportedCvConfig {
  if (!isObject(config)) {
    throw new Error('Invalid config. Expected an object.');
  }

  const template = detectCvTemplate(config);
  if (template === 'professional') {
    return { ...config, cvKind: 'professional' } as ProfessionalCvConfig;
  }

  const europassKind = config.cvKind === 'europass-2' ? 'europass-2' : 'europass';
  return { ...config, cvKind: europassKind } as EuropassCvConfig;
}
