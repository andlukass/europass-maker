import type { EuropassCvConfig } from './types.js';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isEuropassCvConfig(config: unknown): config is EuropassCvConfig {
  if (!isObject(config)) return false;
  if (!isObject(config.personal)) return false;
  if (!isObject(config.sections)) return false;

  return typeof config.personal.name === 'string' && config.personal.name.trim().length > 0;
}
