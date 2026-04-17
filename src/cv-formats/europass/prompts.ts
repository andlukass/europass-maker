import prompts from 'prompts';
import type {
  EuropassCvConfig,
  EuropassExperienceItem,
  EuropassEducationItem,
  EuropassLanguageItem,
} from './types.js';
import type { CvLanguage } from '../common.js';

export async function runEuropassPrompts(): Promise<EuropassCvConfig> {
  const config: EuropassCvConfig = {
    cvKind: 'europass',
    personal: { name: '' },
    sections: {},
  };

  const language = await prompts({
    type: 'select',
    name: 'value',
    message: 'Selecione o idioma do CV',
    choices: [
      { title: 'Portugues', value: 'PT' },
      { title: 'English', value: 'EN' },
    ],
    initial: 0,
  });
  config.cvLanguage = language.value as CvLanguage;

  const photoPath = await prompts({
    type: 'text',
    name: 'value',
    message: 'Caminho para foto (vazio = sem foto)',
    initial: '',
  });
  {
    const value = String(photoPath.value ?? '').trim();
    if (value) config.personal.photoPath = value;
  }

  const name = await prompts({
    type: 'text',
    name: 'value',
    message: 'Nome (obrigatorio)',
    validate: (value: string) => (value?.trim() ? true : 'Nome e obrigatorio'),
  });
  config.personal.name = String(name.value).trim();

  const birthDate = await prompts({
    type: 'text',
    name: 'value',
    message: 'Data de nascimento (vazio = omitir)',
    initial: '',
  });
  {
    const value = String(birthDate.value ?? '').trim();
    if (value) config.personal.birthDate = value;
  }

  const nationality = await prompts({
    type: 'text',
    name: 'value',
    message: 'Nacionalidade (vazio = omitir)',
    initial: '',
  });
  {
    const value = String(nationality.value ?? '').trim();
    if (value) config.personal.nationality = value;
  }

  const sex = await prompts({
    type: 'text',
    name: 'value',
    message: 'Sexo (vazio = omitir)',
    initial: '',
  });
  {
    const value = String(sex.value ?? '').trim();
    if (value) config.personal.sex = value;
  }

  const email = await prompts({
    type: 'text',
    name: 'value',
    message: 'Email (vazio = omitir)',
    initial: '',
  });
  {
    const value = String(email.value ?? '').trim();
    if (value) config.personal.email = value;
  }

  const phone = await prompts({
    type: 'text',
    name: 'value',
    message: 'Telemovel (vazio = omitir)',
    initial: '',
  });
  {
    const value = String(phone.value ?? '').trim();
    if (value) config.personal.phone = value;
  }

  const address = await prompts({
    type: 'text',
    name: 'value',
    message: 'Morada (vazio = omitir)',
    initial: '',
  });
  {
    const value = String(address.value ?? '').trim();
    if (value) config.personal.address = value;
  }

  const hasPresentation = await prompts({
    type: 'toggle',
    name: 'value',
    message: 'Incluir secao Apresentacao?',
    initial: false,
  });
  if (hasPresentation.value) {
    config.sections.presentation = { text: await askMultiline('Conteudo da Apresentacao (linha vazia termina)') };
  }

  const hasObjective = await prompts({
    type: 'toggle',
    name: 'value',
    message: 'Incluir secao Objetivo Profissional?',
    initial: false,
  });
  if (hasObjective.value) {
    const objective = await prompts({
      type: 'text',
      name: 'value',
      message: 'Objetivo profissional',
    });
    config.sections.objective = { text: String(objective.value ?? '').trim() };
  }

  const hasExperience = await prompts({
    type: 'toggle',
    name: 'value',
    message: 'Incluir secao Experiencia Profissional?',
    initial: false,
  });
  if (hasExperience.value) {
    config.sections.experience = await askExperienceItems();
  }

  const hasEducation = await prompts({
    type: 'toggle',
    name: 'value',
    message: 'Incluir secao Educacao e Formacao?',
    initial: false,
  });
  if (hasEducation.value) {
    config.sections.education = await askEducationItems();
  }

  const hasLanguages = await prompts({
    type: 'toggle',
    name: 'value',
    message: 'Incluir secao Competencias Linguisticas?',
    initial: false,
  });
  if (hasLanguages.value) {
    config.sections.languages = await askLanguageItems();
  }

  const hasSkills = await prompts({
    type: 'toggle',
    name: 'value',
    message: 'Incluir secao Habilidades?',
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

async function askExperienceItems(): Promise<EuropassExperienceItem[]> {
  const items: EuropassExperienceItem[] = [];

  let addMore = true;
  while (addMore) {
    const from = await prompts({ type: 'text', name: 'value', message: '  De (ano, ex: 2019)' });
    const to = await prompts({ type: 'text', name: 'value', message: '  Ate (ano, ex: 2024 ou Atual)' });
    const country = await prompts({ type: 'text', name: 'value', message: '  Pais/local (ex: Portugal)' });
    const role = await prompts({
      type: 'text',
      name: 'value',
      message: '  Cargo/funcao',
      validate: (value: string) => (value?.trim() ? true : 'Cargo e obrigatorio'),
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
      message: 'Adicionar outra experiencia?',
      initial: false,
    });
    addMore = !!more.value;
  }

  return items;
}

async function askEducationItems(): Promise<EuropassEducationItem[]> {
  const items: EuropassEducationItem[] = [];

  let addMore = true;
  while (addMore) {
    const title = await prompts({
      type: 'text',
      name: 'value',
      message: '  Titulo da qualificacao',
      validate: (value: string) => (value?.trim() ? true : 'Titulo e obrigatorio'),
    });
    const institution = await prompts({
      type: 'text',
      name: 'value',
      message: '  Instituicao (vazio = omitir)',
    });

    items.push({
      title: String(title.value).trim(),
      institution: String(institution.value ?? '').trim() || undefined,
    });

    const more = await prompts({
      type: 'toggle',
      name: 'value',
      message: 'Adicionar outra formacao?',
      initial: false,
    });
    addMore = !!more.value;
  }

  return items;
}

async function askLanguageItems(): Promise<EuropassLanguageItem[]> {
  const items: EuropassLanguageItem[] = [];

  let addMore = true;
  while (addMore) {
    const language = await prompts({
      type: 'text',
      name: 'value',
      message: '  Lingua (ex: Portugues)',
      validate: (value: string) => (value?.trim() ? true : 'Lingua e obrigatoria'),
    });
    const level = await prompts({
      type: 'text',
      name: 'value',
      message: '  Nivel (ex: C1, Avancado)',
      validate: (value: string) => (value?.trim() ? true : 'Nivel e obrigatorio'),
    });

    items.push({
      language: String(language.value).trim(),
      level: String(level.value).trim(),
    });

    const more = await prompts({
      type: 'toggle',
      name: 'value',
      message: 'Adicionar outra lingua?',
      initial: false,
    });
    addMore = !!more.value;
  }

  return items;
}
