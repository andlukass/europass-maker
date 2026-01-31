#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import type { CvConfig } from './model.js';
import { validateConfig } from './model.js';
import { runInteractivePrompts } from './prompts.js';
import { generateHtml } from './render/html.js';
import { generatePdf } from './render/pdf.js';

interface CliArgs {
  config?: string;
  out?: string;
  saveConfig?: string;
  logo?: string;
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
    } else if (arg === '--save-config' && argv[i + 1]) {
      args.saveConfig = argv[++i];
    } else if (arg === '--logo' && argv[i + 1]) {
      args.logo = argv[++i];
    }
  }
  return args;
}

function loadConfig(path: string): CvConfig {
  const absPath = resolve(process.cwd(), path);
  const content = readFileSync(absPath, 'utf-8');
  const parsed = JSON.parse(content) as unknown;
  if (!validateConfig(parsed)) {
    throw new Error('Invalid config: "personal.name" is required and must be non-empty');
  }
  return parsed as CvConfig;
}

function saveConfig(config: CvConfig, path: string): void {
  const absPath = resolve(process.cwd(), path);
  writeFileSync(absPath, JSON.stringify(config, null, 2), 'utf-8');
  console.log(`Config saved to ${absPath}`);
}

async function main(): Promise<void> {
  const args = parseArgs();
  const saveConfigPath = args.saveConfig ?? './configs/cv-config.json';

  let config: CvConfig;

  if (args.config) {
    config = loadConfig(args.config);
  } else {
    config = await runInteractivePrompts();
    saveConfig(config, saveConfigPath);
  }

  const outPath = args.out ?? config.outputPdf ?? './cv-europass.pdf';

  const html = generateHtml(config, args.logo ?? config.logoPath);
  await generatePdf(html, resolve(process.cwd(), outPath));
  console.log(`PDF saved to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
