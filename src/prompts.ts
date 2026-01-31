import prompts from 'prompts';
import type { CvConfig, ExperienceItem, EducationItem, LanguageItem } from './model.js';

export async function runInteractivePrompts(): Promise<CvConfig> {
  const config: CvConfig = {
    personal: { name: '' },
    sections: {},
  };

  // --- Personal data ---
  const photoPath = await prompts({
    type: 'text',
    name: 'value',
    message: 'Caminho para foto (vazio = sem foto)',
    initial: '',
  });
  {
    const s = String(photoPath.value ?? '').trim();
    if (s) config.personal.photoPath = s;
  }

  const name = await prompts({
    type: 'text',
    name: 'value',
    message: 'Nome (obrigatório)',
    validate: (v: string) => (v?.trim() ? true : 'Nome é obrigatório'),
  });
  config.personal.name = String(name.value).trim();

  const nationality = await prompts({
    type: 'text',
    name: 'value',
    message: 'Nacionalidade (vazio = omitir)',
    initial: '',
  });
  {
    const s = String(nationality.value ?? '').trim();
    if (s) config.personal.nationality = s;
  }

  const sex = await prompts({
    type: 'text',
    name: 'value',
    message: 'Sexo (vazio = omitir)',
    initial: '',
  });
  {
    const s = String(sex.value ?? '').trim();
    if (s) config.personal.sex = s;
  }

  const email = await prompts({
    type: 'text',
    name: 'value',
    message: 'Email (vazio = omitir)',
    initial: '',
  });
  {
    const s = String(email.value ?? '').trim();
    if (s) config.personal.email = s;
  }

  const phone = await prompts({
    type: 'text',
    name: 'value',
    message: 'Telemóvel (vazio = omitir)',
    initial: '',
  });
  {
    const s = String(phone.value ?? '').trim();
    if (s) config.personal.phone = s;
  }

  const address = await prompts({
    type: 'text',
    name: 'value',
    message: 'Morada (vazio = omitir)',
    initial: '',
  });
  {
    const s = String(address.value ?? '').trim();
    if (s) config.personal.address = s;
  }

  // --- Sections ---

  const hasPresentation = await prompts({
    type: 'toggle',
    name: 'value',
    message: 'Incluir secção Apresentação?',
    initial: false,
  });
  if (hasPresentation.value) {
    config.sections.presentation = { text: await askMultiline('Conteúdo da Apresentação (linha vazia termina)') };
  }

  const hasObjective = await prompts({
    type: 'toggle',
    name: 'value',
    message: 'Incluir secção Objetivo Profissional?',
    initial: false,
  });
  if (hasObjective.value) {
    const obj = await prompts({
      type: 'text',
      name: 'value',
      message: 'Objetivo profissional',
    });
    config.sections.objective = { text: String(obj.value ?? '').trim() };
  }

  const hasExperience = await prompts({
    type: 'toggle',
    name: 'value',
    message: 'Incluir secção Experiência Profissional?',
    initial: false,
  });
  if (hasExperience.value) {
    config.sections.experience = await askExperienceItems();
  }

  const hasEducation = await prompts({
    type: 'toggle',
    name: 'value',
    message: 'Incluir secção Educação e Formação?',
    initial: false,
  });
  if (hasEducation.value) {
    config.sections.education = await askEducationItems();
  }

  const hasLanguages = await prompts({
    type: 'toggle',
    name: 'value',
    message: 'Incluir secção Competências Linguísticas?',
    initial: false,
  });
  if (hasLanguages.value) {
    config.sections.languages = await askLanguageItems();
  }

  const hasSkills = await prompts({
    type: 'toggle',
    name: 'value',
    message: 'Incluir secção Habilidades?',
    initial: false,
  });
  if (hasSkills.value) {
    config.sections.skills = await askBulletList('Habilidade (linha vazia termina)');
  }

  return config;
}

async function askMultiline(message: string): Promise<string> {
  const lines: string[] = [];
  console.log(`\n${message}`);
  const readline = await import('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const ask = (): Promise<string> =>
    new Promise((resolve) => {
      rl.question('> ', (line) => resolve(line ?? ''));
    });

  let line = await ask();
  while (line !== '') {
    lines.push(line);
    line = await ask();
  }
  rl.close();
  return lines.join('\n').trim();
}

async function askBulletList(message: string): Promise<string[]> {
  const items: string[] = [];
  console.log(`\n${message}`);
  const readline = await import('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const ask = (): Promise<string> =>
    new Promise((resolve) => {
      rl.question('> ', (line) => resolve(line ?? ''));
    });

  let line = await ask();
  while (line !== '') {
    items.push(line.trim());
    line = await ask();
  }
  rl.close();
  return items;
}

async function askExperienceItems(): Promise<ExperienceItem[]> {
  const items: Array<{
    from?: string;
    to?: string;
    country?: string;
    role: string;
    company?: string;
    bullets?: string[];
  }> = [];

  let addMore = true;
  while (addMore) {
    const from = await prompts({ type: 'text', name: 'value', message: '  De (ano, ex: 2019)' });
    const to = await prompts({ type: 'text', name: 'value', message: '  A (ano, ex: 2024 ou Atual)' });
    const country = await prompts({ type: 'text', name: 'value', message: '  País/local (ex: Brasil)' });
    const role = await prompts({
      type: 'text',
      name: 'value',
      message: '  Cargo/função',
      validate: (v: string) => (v?.trim() ? true : 'Cargo é obrigatório'),
    });
    const company = await prompts({ type: 'text', name: 'value', message: '  Empresa (vazio = omitir)' });

    const bullets = await askBulletList('  Responsabilidades (linha vazia termina)');

    items.push({
      from: String(from.value ?? '').trim() || undefined,
      to: String(to.value ?? '').trim() || undefined,
      country: String(country.value ?? '').trim() || undefined,
      role: String(role.value).trim(),
      company: String(company.value ?? '').trim() || undefined,
      bullets: bullets.length ? bullets : undefined,
    });

    const more = await prompts({
      type: 'toggle',
      name: 'value',
      message: 'Adicionar outra experiência?',
      initial: false,
    });
    addMore = !!more.value;
  }

  return items;
}

async function askEducationItems(): Promise<EducationItem[]> {
  const items: EducationItem[] = [];

  let addMore = true;
  while (addMore) {
    const title = await prompts({
      type: 'text',
      name: 'value',
      message: '  Título da qualificação (ex: Ensino Secundário Completo 12º)',
      validate: (v: string) => (v?.trim() ? true : 'Título é obrigatório'),
    });
    const institution = await prompts({
      type: 'text',
      name: 'value',
      message: '  Instituição (vazio = omitir)',
    });

    items.push({
      title: String(title.value).trim(),
      institution: String(institution.value ?? '').trim() || undefined,
    });

    const more = await prompts({
      type: 'toggle',
      name: 'value',
      message: 'Adicionar outra formação?',
      initial: false,
    });
    addMore = !!more.value;
  }

  return items;
}

async function askLanguageItems(): Promise<LanguageItem[]> {
  const items: LanguageItem[] = [];

  let addMore = true;
  while (addMore) {
    const language = await prompts({
      type: 'text',
      name: 'value',
      message: '  Língua (ex: Português)',
      validate: (v: string) => (v?.trim() ? true : 'Língua é obrigatória'),
    });
    const level = await prompts({
      type: 'text',
      name: 'value',
      message: '  Nível (ex: Materna, C1, Avançado)',
      validate: (v: string) => (v?.trim() ? true : 'Nível é obrigatório'),
    });

    items.push({
      language: String(language.value).trim(),
      level: String(level.value).trim(),
    });

    const more = await prompts({
      type: 'toggle',
      name: 'value',
      message: 'Adicionar outra língua?',
      initial: false,
    });
    addMore = !!more.value;
  }

  return items;
}
