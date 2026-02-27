#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import type { SupportedCvConfig } from './cv-formats/types.js';
import { parseCvConfig, detectCvTemplate } from './cv-formats/detect.js';
import { isEuropassCvConfig } from './cv-formats/europass/validate.js';
import { runEuropassPrompts } from './cv-formats/europass/prompts.js';
import { generateHtml } from './render/html.js';
import { generatePdf } from './render/pdf.js';

interface CliArgs {
  config?: string;
  out?: string;
  rasc?: boolean;
}

function parseArgs(): CliArgs {
  const args: CliArgs = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--config' && argv[i + 1]) {
      args.config = argv[++i];
    } else if (arg === '--out' && argv[i + 1]) {
      args.out = argv[++i];
    } else if (arg === '--rasc') {
      args.rasc = true;
    }
  }
  return args;
}

function loadConfig(path: string): SupportedCvConfig {
  const absPath = resolve(process.cwd(), path);
  const content = readFileSync(absPath, 'utf-8');
  const parsed = JSON.parse(content) as unknown;
  return parseCvConfig(parsed);
}

function saveConfig(config: SupportedCvConfig, path: string): void {
  const absPath = resolve(process.cwd(), path);
  writeFileSync(absPath, JSON.stringify(config, null, 2), 'utf-8');
  console.log(`Config saved to ${absPath}`);
}

async function main(): Promise<void> {
  const args = parseArgs();
  const saveConfigPath = './configs/cv-config.json';

  let config: SupportedCvConfig;

  if (args.config) {
    config = loadConfig(args.config);
  } else {
    config = await runEuropassPrompts();
    saveConfig(config, saveConfigPath);
  }

  const template = detectCvTemplate(config);
  const defaultOutPath = template === 'professional' ? './cv-professional.pdf' : './cv-europass.pdf';
  const outPath = args.out ?? defaultOutPath;

  if (args.rasc && !isEuropassCvConfig(config)) {
    console.warn('--rasc is only supported for the Europass template and will be ignored.');
  }

  const html = generateHtml(config, args.rasc);
  await generatePdf(html, resolve(process.cwd(), outPath));
  console.log(`PDF saved to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
