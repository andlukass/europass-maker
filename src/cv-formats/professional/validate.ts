import type { ProfessionalCvConfig } from './types.js';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isProfessionalCvConfig(config: unknown): config is ProfessionalCvConfig {
  if (!isObject(config)) return false;
  if (!isObject(config.header)) return false;
  if (!isObject(config.summary)) return false;
  if (!isObject(config.sections)) return false;

  const name = config.header.name;
  const summaryText = config.summary.text;

  return (
    typeof name === 'string' &&
    name.trim().length > 0 &&
    typeof summaryText === 'string' &&
    summaryText.trim().length > 0
  );
}
